function initSound() {
  const altRect = document.querySelector('.altRect');
  if (!altRect) return;

  const AC = window.AudioContext || window.webkitAudioContext;
  let ac = null,
    masterGain = null;
  let masterVol = 0.8,
    globalOn = false;

  function boot() {
    if (!ac) {
      ac = new AC();
      masterGain = ac.createGain();
      masterGain.gain.value = masterVol;
      masterGain.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
  }

  const nodeInstances = {};
  let moduleCounter = 0;
  let connections = [];
  let pendingConnector = null;

  function buildAudio(id) {
    const n = nodeInstances[id];
    if (!n) return;
    teardownAudio(id);
    boot();
    const p = n.p;

    if (n.type === 'ОСЦ') {
      const g = ac.createGain();
      g.gain.value = (p.vol / 100) * 0.35;
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = p.freq;
      osc.detune.value = p.detune;
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      n._audio = {
        stop: () => {
          try {
            osc.stop();
          } catch (e) {}
        },
        gain: g
      };
    } else if (n.type === 'УД') {
      const g = ac.createGain();
      g.gain.value = 1;
      let alive = true;
      const hit = () => {
        if (!alive || !ac) return;
        const o = ac.createOscillator(),
          eg = ac.createGain();
        o.frequency.setValueAtTime(p.pitch * 3, ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(
          p.pitch * 0.35,
          ac.currentTime + p.decay / 1000
        );
        eg.gain.setValueAtTime((p.vol / 100) * 0.9, ac.currentTime);
        eg.gain.exponentialRampToValueAtTime(
          0.001,
          ac.currentTime + p.decay / 1000
        );
        o.connect(eg);
        eg.connect(g);
        g.connect(masterGain);
        o.start();
        o.stop(ac.currentTime + p.decay / 1000 + 0.05);
      };
      hit();
      const iv = setInterval(() => alive && hit(), 60000 / p.bpm);
      n._audio = {
        stop: () => {
          alive = false;
          clearInterval(iv);
        },
        gain: g
      };
    } else if (n.type === 'БАСС') {
      const g = ac.createGain();
      g.gain.value = (p.vol / 100) * 0.4;
      const osc = ac.createOscillator(),
        flt = ac.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.value = p.freq;
      flt.type = 'lowpass';
      flt.frequency.value = p.cutoff;
      flt.Q.value = 3;
      osc.connect(flt);
      flt.connect(g);
      g.connect(masterGain);
      osc.start();
      n._audio = {
        stop: () => {
          try {
            osc.stop();
          } catch (e) {}
        },
        gain: g
      };
    } else if (n.type === 'ПЭД') {
      const g = ac.createGain();
      g.gain.value = (p.vol / 100) * 0.22;
      const oscs = [1, 1.25, 1.5, 2, 2.5].map((r, i) => {
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.value = p.freq * r;
        o.detune.value = (i % 2 ? -1 : 1) * p.spread * (i + 1);
        o.connect(g);
        o.start();
        return o;
      });
      g.connect(masterGain);
      n._audio = {
        stop: () =>
          oscs.forEach((o) => {
            try {
              o.stop();
            } catch (e) {}
          }),
        gain: g
      };
    } else if (n.type === 'ФИЛЬТР') {
      const flt = ac.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.value = p.freq;
      flt.Q.value = p.q;
      const g = ac.createGain();
      g.gain.value = p.mix / 100;
      flt.connect(g);
      g.connect(masterGain);
      n._audio = { stop: () => {}, inputNode: flt, gain: g };
    } else if (n.type === 'РЕВЕРБ') {
      const len = ac.sampleRate * p.size;
      const rb = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = rb.getChannelData(c);
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5);
      }
      const flt = ac.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.value = p.tone;
      const conv = ac.createConvolver();
      conv.buffer = rb;
      const entry = ac.createGain();
      const g = ac.createGain();
      g.gain.value = p.mix / 100;
      entry.connect(flt);
      flt.connect(conv);
      conv.connect(g);
      g.connect(masterGain);
      n._audio = { stop: () => {}, inputNode: entry, gain: g };
    }
    n.playing = true;
  }

  function teardownAudio(id) {
    const n = nodeInstances[id];
    if (!n || !n._audio) return;
    try {
      n._audio.stop();
    } catch (e) {}
    try {
      n._audio.gain?.disconnect();
    } catch (e) {}
    try {
      n._audio.inputNode?.disconnect();
    } catch (e) {}
    n._audio = null;
    n.playing = false;
  }

  function rewireAll() {
    if (!ac) return;
    Object.keys(nodeInstances).forEach((id) => {
      const n = nodeInstances[id];
      if (!n.playing || !n._audio) return;
      const isFx = n.type === 'ФИЛЬТР' || n.type === 'РЕВЕРБ';
      if (!isFx) {
        const wire = connections.find((c) => c.fromId === id);
        const fxId = wire?.toId;
        const fxInput = fxId && nodeInstances[fxId]?._audio?.inputNode;
        const dest = fxInput || masterGain;
        try {
          n._audio.gain.disconnect();
        } catch (e) {}
        n._audio.gain.connect(dest);
      }
    });
  }

  function startAll() {
    boot();
    Object.keys(nodeInstances)
      .filter(
        (id) =>
          nodeInstances[id].type === 'ФИЛЬТР' ||
          nodeInstances[id].type === 'РЕВЕРБ'
      )
      .forEach(buildAudio);
    Object.keys(nodeInstances)
      .filter(
        (id) =>
          nodeInstances[id].type !== 'ФИЛЬТР' &&
          nodeInstances[id].type !== 'РЕВЕРБ'
      )
      .forEach(buildAudio);
    rewireAll();
  }

  function stopAll() {
    Object.keys(nodeInstances).forEach(teardownAudio);
  }

  const moduleConfigs = {
    ОСЦ: {
      connectorLeft: false,
      params: [
        { k: 'freq', l: 'Частота', min: 80, max: 880, v: 220 },
        { k: 'detune', l: 'Детюн', min: -50, max: 50, v: 0 },
        { k: 'vol', l: 'Уровень', min: 0, max: 100, v: 60 }
      ]
    },
    УД: {
      connectorLeft: false,
      params: [
        { k: 'bpm', l: 'BPM', min: 40, max: 200, v: 120 },
        { k: 'pitch', l: 'Высота', min: 30, max: 120, v: 55 },
        { k: 'decay', l: 'Затух', min: 80, max: 700, v: 340 },
        { k: 'vol', l: 'Уровень', min: 0, max: 100, v: 75 }
      ]
    },
    БАСС: {
      connectorLeft: false,
      params: [
        { k: 'freq', l: 'Нота', min: 30, max: 200, v: 55 },
        { k: 'cutoff', l: 'Срез', min: 200, max: 3000, v: 600 },
        { k: 'vol', l: 'Уровень', min: 0, max: 100, v: 65 }
      ]
    },
    ПЭД: {
      connectorLeft: false,
      params: [
        { k: 'freq', l: 'Основа', min: 60, max: 500, v: 130 },
        { k: 'spread', l: 'Ширина', min: 1, max: 20, v: 8 },
        { k: 'vol', l: 'Уровень', min: 0, max: 100, v: 50 }
      ]
    },
    ФИЛЬТР: {
      connectorLeft: true,
      params: [
        { k: 'freq', l: 'Частота', min: 100, max: 8000, v: 1200 },
        { k: 'q', l: 'Резонанс', min: 0, max: 20, v: 4 },
        { k: 'mix', l: 'Микс', min: 0, max: 100, v: 80 }
      ]
    },
    РЕВЕРБ: {
      connectorLeft: true,
      params: [
        { k: 'size', l: 'Размер', min: 1, max: 10, v: 3 },
        { k: 'tone', l: 'Тон', min: 200, max: 6000, v: 2000 },
        { k: 'mix', l: 'Микс', min: 0, max: 100, v: 70 }
      ]
    }
  };

  const svgLayer = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  svgLayer.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
  altRect.appendChild(svgLayer);

  function getConnectorCenter(connector) {
    const rectBounds = altRect.getBoundingClientRect();
    const cBounds = connector.getBoundingClientRect();
    return {
      x: cBounds.left - rectBounds.left + cBounds.width / 2,
      y: cBounds.top - rectBounds.top + cBounds.height / 2
    };
  }

  function updateLines() {
    connections.forEach(({ fromId, toId, line }) => {
      const from = altRect.querySelector(
        `[data-uid="${fromId}"] .nodeConnector`
      );
      const to = altRect.querySelector(`[data-uid="${toId}"] .nodeConnector`);
      if (!from || !to) return;
      const p1 = getConnectorCenter(from);
      const p2 = getConnectorCenter(to);
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
    });
  }

  function updateConnectorStates() {
    const connectedUids = new Set();
    connections.forEach(({ fromId, toId }) => {
      connectedUids.add(fromId);
      connectedUids.add(toId);
    });
    altRect.querySelectorAll('.nodeModule').forEach((mod) => {
      const connector = mod.querySelector('.nodeConnector');
      connector.classList.toggle(
        'nodeConnector--connected',
        connectedUids.has(mod.dataset.uid)
      );
    });
  }

  function removeConnectionsFor(uid) {
    connections = connections.filter(({ fromId, toId, line }) => {
      if (fromId === uid || toId === uid) {
        line.remove();
        return false;
      }
      return true;
    });
    updateConnectorStates();
  }

  function makeSlider(track, thumb, onUpdate) {
    let dragging = false;
    track.addEventListener('mousedown', (e) => {
      dragging = true;
      move(e);
      e.stopPropagation();
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) move(e);
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
    });
    function move(e) {
      const bounds = track.getBoundingClientRect();
      let pct = (e.clientX - bounds.left) / bounds.width;
      pct = Math.max(0, Math.min(1, pct));
      thumb.style.left = pct * 100 + '%';
      thumb.style.top = '50%';
      thumb.style.transform = 'translate(-50%, -50%)';
      if (onUpdate) onUpdate(pct);
    }
  }

  function makeDraggable(el) {
    let startX, startY, startLeft, startTop;
    el.querySelector('.nodeHeader').addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('nodeClose')) return;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(el.style.left) || 0;
      startTop = parseInt(el.style.top) || 0;
      el.style.zIndex = ++moduleCounter + 10;
      function onMove(e) {
        const rb = altRect.getBoundingClientRect();
        el.style.left =
          Math.max(
            0,
            Math.min(startLeft + e.clientX - startX, rb.width - el.offsetWidth)
          ) + 'px';
        el.style.top =
          Math.max(
            0,
            Math.min(startTop + e.clientY - startY, rb.height - el.offsetHeight)
          ) + 'px';
        updateLines();
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
  }

  function createModule(name) {
    const config = moduleConfigs[name];
    const uid = String(++moduleCounter);
    const rect = altRect.getBoundingClientRect();
    const p = {};
    config.params.forEach((pd) => (p[pd.k] = pd.v));
    nodeInstances[uid] = { type: name, p, playing: false, _audio: null };

    const mod = document.createElement('div');
    mod.className = 'nodeModule';
    mod.dataset.uid = uid;
    mod.style.left = 40 + Math.random() * Math.max(0, rect.width - 320) + 'px';
    mod.style.top = 40 + Math.random() * Math.max(0, rect.height - 220) + 'px';
    mod.style.zIndex = moduleCounter + 10;

    mod.innerHTML = `
      <div class="nodeHeader">
        <span class="nodeTitle">${name}</span>
        <button class="nodeClose">×</button>
      </div>
      <div class="nodeBody">
        ${config.params
          .map((pd) => {
            const pct = (((pd.v - pd.min) / (pd.max - pd.min)) * 100).toFixed(
              1
            );
            return `<div class="nodeRow">
            <span class="nodeLabel">${pd.l}</span>
            <div class="nodeSlider">
              <div class="nodeTrack">
                <div class="nodeThumb" style="left:${pct}%;top:50%;transform:translate(-50%,-50%)"></div>
              </div>
            </div>
          </div>`;
          })
          .join('')}
      </div>
      <div class="nodeConnector${config.connectorLeft ? ' nodeConnector--left' : ''}"></div>
    `;

    mod.querySelectorAll('.nodeTrack').forEach((track, i) => {
      const thumb = track.querySelector('.nodeThumb');
      const pd = config.params[i];
      makeSlider(track, thumb, (pct) => {
        nodeInstances[uid].p[pd.k] = pd.min + pct * (pd.max - pd.min);
        if (globalOn && nodeInstances[uid].playing) {
          teardownAudio(uid);
          buildAudio(uid);
          rewireAll();
        }
      });
    });

    mod.querySelector('.nodeClose').addEventListener('click', () => {
      teardownAudio(uid);
      delete nodeInstances[uid];
      removeConnectionsFor(uid);
      if (pendingConnector?.closest('[data-uid]')?.dataset.uid === uid) {
        pendingConnector.classList.remove('nodeConnector--active');
        pendingConnector = null;
      }
      mod.remove();
    });

    const connector = mod.querySelector('.nodeConnector');
    connector.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!pendingConnector) {
        pendingConnector = connector;
        connector.classList.add('nodeConnector--active');
      } else if (pendingConnector === connector) {
        pendingConnector.classList.remove('nodeConnector--active');
        pendingConnector = null;
      } else {
        const fromUid = pendingConnector.closest('[data-uid]').dataset.uid;
        const toUid = uid;
        const exists = connections.some(
          (c) =>
            (c.fromId === fromUid && c.toId === toUid) ||
            (c.fromId === toUid && c.toId === fromUid)
        );
        if (!exists) {
          const line = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          line.setAttribute('stroke', '#000');
          line.setAttribute('stroke-width', '1.6');
          line.style.pointerEvents = 'stroke';
          line.style.cursor = 'pointer';
          line.addEventListener('click', () => {
            line.remove();
            connections = connections.filter((c) => c.line !== line);
            updateConnectorStates();
            if (globalOn) rewireAll();
          });
          svgLayer.appendChild(line);
          connections.push({ fromId: fromUid, toId: toUid, line });
          updateLines();
          if (globalOn) rewireAll();
        }
        pendingConnector.classList.remove('nodeConnector--active');
        pendingConnector = null;
        updateConnectorStates();
      }
    });

    makeDraggable(mod);
    altRect.appendChild(mod);
    if (globalOn) {
      buildAudio(uid);
      rewireAll();
    }
  }

  // Слайдер громкости
  const volTrack = document.querySelector('.sgVolumeTrack');
  const volThumb = document.querySelector('.sgVolumeThumb');
  const volValue = document.querySelector('.sgVolumeValue');
  if (volTrack && volThumb && volValue) {
    makeSlider(volTrack, volThumb, (pct) => {
      masterVol = pct;
      volValue.textContent = Math.round(pct * 100) + '%';
      if (masterGain) masterGain.gain.value = masterVol;
    });
  }

  document.querySelectorAll('.sgPanelLeft .sgBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.textContent.trim();
      if (moduleConfigs[name]) createModule(name);
    });
  });

  const startStopBtn = document.querySelector(
    '.sgPanelRight .sgBtn:last-child'
  );
  if (startStopBtn) {
    startStopBtn.addEventListener('click', () => {
      globalOn = !globalOn;
      if (globalOn) {
        startAll();
        startStopBtn.style.background = '#000';
        startStopBtn.style.color = '#fff';
      } else {
        stopAll();
        startStopBtn.style.background = '#fff';
        startStopBtn.style.color = '#000';
      }
    });
  }

  const clearBtn = document.querySelector('.sgPanelRight .sgBtn:first-child');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      stopAll();
      altRect.querySelectorAll('.nodeModule').forEach((m) => m.remove());
      connections.forEach(({ line }) => line.remove());
      connections = [];
      pendingConnector = null;
      Object.keys(nodeInstances).forEach((id) => delete nodeInstances[id]);
      globalOn = false;
      if (startStopBtn) {
        startStopBtn.style.background = '#fff';
        startStopBtn.style.color = '#000';
      }
    });
  }
}
