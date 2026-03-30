// ─── ЖУРНАЛ ───

function generateMockPoints(count, w, h, style) {
  const pts = [];
  let x = w / 2,
    y = h / 2;
  let vx = 0,
    vy = 0;
  const t = Date.now();

  for (let i = 0; i < count; i++) {
    if (style === 'chaotic') {
      vx += (Math.random() - 0.5) * 18;
      vy += (Math.random() - 0.5) * 18;
    } else if (style === 'calm') {
      vx += (Math.random() - 0.5) * 4;
      vy += (Math.random() - 0.5) * 4;
    } else if (style === 'anxious') {
      vx += (Math.random() - 0.5) * 10;
      vy += (Math.random() - 0.5) * 10;
    } else if (style === 'linear') {
      vx += (Math.random() - 0.3) * 6;
      vy += (Math.random() - 0.5) * 2;
    }

    vx *= 0.82;
    vy *= 0.82;
    x += vx;
    y += vy;

    if (x < 20) {
      x = 20;
      vx *= -0.5;
    }
    if (x > w - 20) {
      x = w - 20;
      vx *= -0.5;
    }
    if (y < 20) {
      y = 20;
      vy *= -0.5;
    }
    if (y > h - 20) {
      y = h - 20;
      vy *= -0.5;
    }

    pts.push({ x: Math.round(x), y: Math.round(y), t: t + i * 20 });
  }
  return pts;
}

const W = 900,
  H = 500;

const GLITCH_ID = '\u25A1\u2592\uFFFD\u2593\u25A0\u2588';

const MOCK_SESSIONS = [
  {
    id: 'RZSMARO',
    date: '27.02.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u0441\u0440\u0435\u0434\u043d\u044f\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u0431\u0435\u0441\u043f\u043e\u043a\u043e\u0439\u043d\u044b\u0439'
    },
    points: generateMockPoints(420, W, H, 'anxious')
  },
  {
    id: 'PWCGTUY',
    date: '21.01.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u0432\u044b\u0441\u043e\u043a\u0430\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u0445\u0430\u043e\u0442\u0438\u0447\u043d\u044b\u0439'
    },
    points: generateMockPoints(680, W, H, 'chaotic')
  },
  {
    id: 'SJKNPXE',
    date: '15.01.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u0441\u0440\u0435\u0434\u043d\u044f\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439'
    },
    points: generateMockPoints(510, W, H, 'anxious')
  },
  {
    id: 'BKRMVWZ',
    date: '10.01.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u0441\u0440\u0435\u0434\u043d\u044f\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u043d\u0435\u0443\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439'
    },
    points: generateMockPoints(390, W, H, 'anxious')
  },
  {
    id: 'QTLXFPD',
    date: '05.01.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u043d\u0438\u0437\u043a\u0430\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u0441\u043f\u043e\u043a\u043e\u0439\u043d\u044b\u0439'
    },
    points: generateMockPoints(280, W, H, 'calm')
  },
  {
    id: 'HNVYCRS',
    date: '01.01.2026',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u043d\u0438\u0437\u043a\u0430\u044f',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u043e\u0441\u0442\u043e\u0440\u043e\u0436\u043d\u044b\u0439'
    },
    points: generateMockPoints(310, W, H, 'calm')
  },
  {
    id: GLITCH_ID,
    date: '28.12.2025',
    analysis: {
      '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c':
        '\u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430',
      '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f':
        '\u043d\u0435\u043b\u0438\u043d\u0435\u0439\u043d\u044b\u0439'
    },
    points: generateMockPoints(555, W, H, 'linear')
  }
];

function getTag(analysis) {
  const anxiety =
    (analysis &&
      analysis[
        '\u0422\u0440\u0435\u0432\u043e\u0436\u043d\u043e\u0441\u0442\u044c'
      ]) ||
    '';
  const char =
    (analysis &&
      analysis[
        '\u0425\u0430\u0440\u0430\u043a\u0442\u0435\u0440 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f'
      ]) ||
    '';
  if (anxiety === '\u0432\u044b\u0441\u043e\u043a\u0430\u044f')
    return {
      label:
        '\u041a\u0440\u0430\u0439\u043d\u0435 \u0442\u0440\u0435\u0432\u043e\u0436\u0435\u043d',
      cls: 'journalCardTag--critical'
    };
  if (anxiety === '\u0441\u0440\u0435\u0434\u043d\u044f\u044f')
    return {
      label: '\u0422\u0440\u0435\u0432\u043e\u0436\u0435\u043d',
      cls: 'journalCardTag--anxious'
    };
  if (
    char === '\u0441\u043f\u043e\u043a\u043e\u0439\u043d\u044b\u0439' ||
    char === '\u043e\u0441\u0442\u043e\u0440\u043e\u0436\u043d\u044b\u0439'
  )
    return {
      label: '\u0421\u0442\u0430\u0431\u0438\u043b\u0435\u043d',
      cls: 'journalCardTag--stable'
    };
  return { label: '\u0418\u043d\u043e\u0435', cls: 'journalCardTag--other' };
}

function filterGroup(tag) {
  const l = tag.label.toLowerCase();
  if (l.includes('\u0442\u0440\u0435\u0432\u043e\u0436'))
    return '\u0442\u0440\u0435\u0432\u043e\u0436\u043d\u044b\u0435';
  if (l.includes('\u0441\u0442\u0430\u0431\u0438\u043b'))
    return '\u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u044b\u0435';
  return '\u0438\u043d\u044b\u0435';
}

// ── Глитч-анимация ─────────────────────────────────────────────────────────
const GLITCH_CHARS =
  '\u25A1\u25A0\u2592\u2593\u2591\u2588\u2580\u2584\uFFFD\u25AA\u25AB\u2022\u00B7\u25CF\u25CB\u2610\u2611\u2612\u2639\u2BEF\u16DD\u2BEB';

function startGlitch(el) {
  let active = true;

  function tick() {
    if (!active) return;
    const result = GLITCH_ID.split('')
      .map((char, i) => {
        const prob = [0.4, 0.7, 0.3, 0.6, 0.5, 0.8][i] || 0.4;
        if (Math.random() < prob) {
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return char;
      })
      .join('');
    el.textContent = 'ID: ' + result;
    const delay =
      Math.random() < 0.15
        ? Math.random() * 800 + 300
        : Math.random() * 100 + 30;
    setTimeout(tick, delay);
  }

  tick();

  setInterval(() => {
    if (Math.random() < 0.12) el.textContent = 'ID: ' + GLITCH_ID;
  }, 1800);

  return () => {
    active = false;
  };
}

// ── Общие вспомогательные функции ──────────────────────────────────────────
function makeScalers(points, cw, ch, pad) {
  const xs = points.map((p) => p.x),
    ys = points.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1,
    rangeY = maxY - minY || 1;
  return {
    sx: (x) => pad + ((x - minX) / rangeX) * (cw - pad * 2),
    sy: (y) => pad + ((y - minY) / rangeY) * (ch - pad * 2)
  };
}

function drawSmoothPath(ctx, points, sx, sy, alpha, lineWidth) {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx(points[0].x), sy(points[0].y));
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const mx = (sx(prev.x) + sx(curr.x)) / 2;
    const my = (sy(prev.y) + sy(curr.y)) / 2;
    ctx.quadraticCurveTo(sx(prev.x), sy(prev.y), mx, my);
  }
  ctx.lineTo(sx(points[points.length - 1].x), sy(points[points.length - 1].y));
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawHeat(ctx, points, sx, sy, r) {
  points.forEach((pt, i) => {
    if (i % 5 !== 0) return;
    const grad = ctx.createRadialGradient(
      sx(pt.x),
      sy(pt.y),
      0,
      sx(pt.x),
      sy(pt.y),
      r
    );
    grad.addColorStop(0, 'rgba(0,0,0,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx(pt.x), sy(pt.y), r, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ── Превью трека на карточке ────────────────────────────────────────────────
function drawPreview(canvas, points) {
  if (!canvas || !points || points.length < 2) return;
  const cw = (canvas.width = canvas.offsetWidth || 300);
  const ch = (canvas.height = canvas.offsetHeight || 160);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, cw, ch);

  const { sx, sy } = makeScalers(points, cw, ch, 10);

  drawHeat(ctx, points, sx, sy, 10);
  drawSmoothPath(ctx, points, sx, sy, 0.5, 0.8);

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(sx(points[0].x), sy(points[0].y), 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    sx(points[points.length - 1].x),
    sy(points[points.length - 1].y),
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ── Воспроизведение ─────────────────────────────────────────────────────────
let replayAnimation = null;
let stopReplayGlitch = null;

function openReplay(session) {
  let modal = document.getElementById('journalReplayModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'journalReplayModal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:1000;
      background:rgba(255,255,255,0.97);
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      gap:20px;
    `;
    modal.innerHTML = `
      <div style="font-size:16px;letter-spacing:-0.47px;color:#000;">
        ID: <span id="replayId"></span>
      </div>
      <canvas id="replayCanvas" style="border:1.6px solid #000;background:#fff;"></canvas>
      <button id="replayClose" style="height:36px;padding:0 16px;border:1.6px solid #000;background:#000;color:#fff;font-family:'Helvetica Neue',sans-serif;font-size:16px;letter-spacing:-0.47px;cursor:pointer;">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button>
    `;
    document.body.appendChild(modal);
  }

  // Останавливаем предыдущий глитч
  if (stopReplayGlitch) {
    stopReplayGlitch();
    stopReplayGlitch = null;
  }

  document.getElementById('replayClose').onclick = () => {
    cancelAnimationFrame(replayAnimation);
    if (stopReplayGlitch) {
      stopReplayGlitch();
      stopReplayGlitch = null;
    }
    modal.style.display = 'none';
  };

  modal.style.display = 'flex';

  const replayIdEl = document.getElementById('replayId');

  if (session.id === GLITCH_ID) {
    replayIdEl.textContent = GLITCH_ID;
    stopReplayGlitch = startGlitch(replayIdEl);
  } else {
    replayIdEl.textContent = session.id;
  }

  const cvs = document.getElementById('replayCanvas');
  cvs.width = Math.min(window.innerWidth - 80, 900);
  cvs.height = Math.min(window.innerHeight - 220, 500);

  startReplay(session);
}

function startReplay(session) {
  cancelAnimationFrame(replayAnimation);
  const cvs = document.getElementById('replayCanvas');
  const ctx = cvs.getContext('2d');
  const pts = session.points || [];
  if (pts.length < 2) return;

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const { sx, sy } = makeScalers(pts, cvs.width, cvs.height, 30);
  let i = 0;
  const speed = Math.max(1, Math.floor(pts.length / 200));

  function frame() {
    if (i >= pts.length) return;
    const pt = pts[i];

    const r = 20;
    const grad = ctx.createRadialGradient(
      sx(pt.x),
      sy(pt.y),
      0,
      sx(pt.x),
      sy(pt.y),
      r
    );
    grad.addColorStop(0, 'rgba(0,0,0,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx(pt.x), sy(pt.y), r, 0, Math.PI * 2);
    ctx.fill();

    if (i > 1) {
      const prev = pts[i - 1];
      const pprev = pts[i - 2];
      const mx = (sx(prev.x) + sx(pt.x)) / 2;
      const my = (sy(prev.y) + sy(pt.y)) / 2;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(
        (sx(pprev.x) + sx(prev.x)) / 2,
        (sy(pprev.y) + sy(prev.y)) / 2
      );
      ctx.quadraticCurveTo(sx(prev.x), sy(prev.y), mx, my);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(sx(pt.x), sy(pt.y), 3, 0, Math.PI * 2);
    ctx.fill();

    i += speed;
    replayAnimation = requestAnimationFrame(frame);
  }

  frame();
}

// ── Главная функция ─────────────────────────────────────────────────────────
function loadJournal() {
  const grid = document.getElementById('journalGrid');
  const countEl = document.getElementById('journalCount');
  if (!grid) return;

  if (countEl)
    countEl.textContent = `\u0412\u0441\u0435\u0433\u043e \u0437\u0430\u043f\u0438\u0441\u0435\u0439: ${MOCK_SESSIONS.length}`;

  document.querySelectorAll('.journalFilterBtn').forEach((btn) => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
  });

  document.querySelectorAll('.journalFilterBtn').forEach((b) => {
    b.classList.remove('journalFilterBtn--active');
    b.style.background = '';
    b.style.color = '';
  });

  const allBtn = document.querySelector('.journalFilterBtn[data-filter="all"]');
  if (allBtn) {
    allBtn.classList.add('journalFilterBtn--active');
    allBtn.style.background = '#000';
    allBtn.style.color = '#fff';
  }

  document.querySelectorAll('.journalFilterBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.journalFilterBtn').forEach((b) => {
        b.classList.remove('journalFilterBtn--active');
        b.style.background = '';
        b.style.color = '';
      });
      btn.classList.add('journalFilterBtn--active');
      btn.style.background = '#000';
      btn.style.color = '#fff';
      renderCards(btn.dataset.filter);
    });
  });

  renderCards('all');
}

function renderCards(filter) {
  const grid = document.getElementById('journalGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = MOCK_SESSIONS.filter((s) => {
    if (filter === 'all') return true;
    const tag = getTag(s.analysis);
    return filterGroup(tag) === filter;
  });

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="journalEmpty">\u041d\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0432 \u044d\u0442\u043e\u0439 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438</div>';
    return;
  }

  filtered.forEach((session) => {
    const tag = getTag(session.analysis);
    const isGlitch = session.id === GLITCH_ID;
    const card = document.createElement('div');
    card.className = 'journalCard';

    card.innerHTML = `
      <div class="journalCardPreview">
        <canvas class="journalCardCanvas" style="width:100%;height:100%;display:block;"></canvas>
      </div>
      <div class="journalCardBody">
        <div class="journalCardId">${isGlitch ? '' : 'ID: ' + session.id}</div>
        <div class="journalCardMeta">\u0414\u0430\u0442\u0430: ${session.date}</div>
        <span class="journalCardTag ${tag.cls}">${tag.label}</span>
      </div>
    `;

    grid.appendChild(card);

    if (isGlitch) {
      const idEl = card.querySelector('.journalCardId');
      idEl.textContent = 'ID: ' + GLITCH_ID;
      startGlitch(idEl);
    }

    requestAnimationFrame(() => {
      const cvs = card.querySelector('.journalCardCanvas');
      drawPreview(cvs, session.points);
    });

    card.addEventListener('click', () => openReplay(session));
  });
}
