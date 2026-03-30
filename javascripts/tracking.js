function initTracking() {
  const diagRect = document.getElementById('diagRect');
  const diagCanvas = document.getElementById('diagCanvas');
  if (!diagRect || !diagCanvas) return;

  const ctx = diagCanvas.getContext('2d');
  const startBtn = document.getElementById('diagStartBtn');
  const timerEl = document.getElementById('diagTimer');
  const timerCount = document.getElementById('diagTimerCount');
  const statusEl = document.getElementById('diagStatus');
  const startOverlay = document.getElementById('diagStart');
  const resultOverlay = document.getElementById('diagResult');
  const resultGrid = document.getElementById('diagResultGrid');

  let recording = false;
  let points = [],
    heatData = [];
  let timerInterval, countdown;

  function resize() {
    diagCanvas.width = diagRect.clientWidth;
    diagCanvas.height = diagRect.clientHeight;
    redraw();
  }
  window.addEventListener('resize', resize);
  resize();

  function redraw() {
    ctx.clearRect(0, 0, diagCanvas.width, diagCanvas.height);
    if (heatData.length === 0) return;
    drawHeatmap();
    drawPath();
  }

  function drawHeatmap() {
    heatData.forEach((pt) => {
      const r = 40;
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      grad.addColorStop(0, 'rgba(0,0,0,0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPath() {
    if (points.length < 2) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
      ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const first = points[0],
      last = points[points.length - 1];
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(first.x, first.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  diagRect.addEventListener('mousemove', (e) => {
    if (!recording) return;
    const rb = diagRect.getBoundingClientRect();
    const x = e.clientX - rb.left,
      y = e.clientY - rb.top,
      t = Date.now();
    points.push({ x, y, t });
    heatData.push({ x, y });
    redraw();
  });

  function startSession() {
    points = [];
    heatData = [];
    ctx.clearRect(0, 0, diagCanvas.width, diagCanvas.height);
    startOverlay.style.display = 'none';
    resultOverlay.style.display = 'none';
    timerEl.style.display = 'block';
    statusEl.style.display = 'block';
    countdown = 15;
    timerCount.textContent = countdown;
    recording = true;
    timerInterval = setInterval(() => {
      countdown--;
      timerCount.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        endSession();
      }
    }, 1000);
  }

  async function saveSession(pts, analysis) {
    if (!sb) return 'S' + Date.now();
    const id = 'S' + Date.now();
    const preview = diagCanvas.toDataURL('image/png', 0.4);
    const session = {
      id,
      date: new Date().toLocaleString('ru'),
      points: pts.map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
        t: p.t
      })),
      analysis,
      preview,
      canvas_w: diagCanvas.width,
      canvas_h: diagCanvas.height
    };
    const { error } = await sb.from('sessions').insert([session]);
    if (error) console.error('Ошибка сохранения:', error);
    return id;
  }

  async function endSession() {
    recording = false;
    timerEl.style.display = 'none';
    statusEl.style.display = 'none';
    const analysis = analyze(points);
    const sessionId = await saveSession(points, analysis);
    showResult(analysis, sessionId);
  }

  function showResult(analysis, sessionId) {
    resultGrid.innerHTML = '';
    const idRow = document.createElement('div');
    idRow.className = 'diagResultRow';
    idRow.innerHTML = `<span class="diagResultLabel">ID сессии</span><span class="diagResultValue">${sessionId}</span>`;
    resultGrid.appendChild(idRow);
    Object.entries(analysis).forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'diagResultRow';
      row.innerHTML = `<span class="diagResultLabel">${label}</span><span class="diagResultValue">${value}</span>`;
      resultGrid.appendChild(row);
    });
    resultOverlay.style.display = 'flex';
  }

  function analyze(pts) {
    if (pts.length < 2) return { 'Данных недостаточно': '—' };
    const speeds = [];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x,
        dy = pts[i].y - pts[i - 1].y;
      const dt = (pts[i].t - pts[i - 1].t) / 1000 || 0.001;
      speeds.push(Math.sqrt(dx * dx + dy * dy) / dt);
    }
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    let pauseCount = 0,
      inPause = false;
    speeds.forEach((s) => {
      if (s < 10 && !inPause) {
        pauseCount++;
        inPause = true;
      }
      if (s >= 10) inPause = false;
    });
    const w = diagCanvas.width,
      h = diagCanvas.height;
    const quadrants = {
      'верх лево': 0,
      'верх право': 0,
      'низ лево': 0,
      'низ право': 0
    };
    pts.forEach((pt) => {
      const qx = pt.x < w / 2 ? 'лево' : 'право';
      const qy = pt.y < h / 2 ? 'верх' : 'низ';
      quadrants[`${qy} ${qx}`]++;
    });
    const dominantQuadrant = Object.entries(quadrants).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const xs = pts.map((p) => p.x),
      ys = pts.map((p) => p.y);
    const coveragePct = Math.round(
      (((Math.max(...xs) - Math.min(...xs)) *
        (Math.max(...ys) - Math.min(...ys))) /
        (w * h)) *
        100
    );
    let character = 'спокойный';
    if (avgSpeed > 400) character = 'импульсивный';
    else if (avgSpeed > 200) character = 'активный';
    else if (pauseCount > 5) character = 'неуверенный';
    else if (avgSpeed < 80) character = 'осторожный';
    let anxiety = 'низкая';
    if (avgSpeed > 300 && pauseCount > 3) anxiety = 'высокая';
    else if (avgSpeed > 200 || pauseCount > 4) anxiety = 'средняя';
    return {
      'Точек зафиксировано': pts.length,
      'Средняя скорость': `${Math.round(avgSpeed)} пкс/с`,
      'Максимальная скорость': `${Math.round(maxSpeed)} пкс/с`,
      'Пауз обнаружено': pauseCount,
      'Охват экрана': `${coveragePct}%`,
      'Доминирующий квадрант': dominantQuadrant,
      'Характер движения': character,
      Тревожность: anxiety
    };
  }

  if (startBtn) startBtn.addEventListener('click', startSession);

  const acceptBtn = document.getElementById('diagAcceptBtn');
  if (acceptBtn) acceptBtn.addEventListener('click', () => showPage('journal'));
}
