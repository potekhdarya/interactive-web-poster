function initThree() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  if (!container) return;

  // ─── Сцена ───
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // ─── Камера — вид сверху ───
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    2000
  );
  camera.position.set(0, 22, 0.001);
  camera.lookAt(0, 0, 0);

  // ─── Рендерер ───
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // ─── Орбитальные контролы ───
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 8;
  controls.maxDistance = 40;
  controls.enablePan = false;
  controls.target.set(0, 1, 0);

  // ─── Line2 материал (гарантированная толщина) ───
  const lineMat = new THREE.LineMaterial({
    color: 0x000000,
    linewidth: 1 // в пикселях, работает везде
  });
  lineMat.resolution.set(container.clientWidth, container.clientHeight);

  // ── Утилиты ──────────────────────────────────────────

  // Вспомогательная: массив Vector3 → Float32Array positions для LineGeometry
  function toPositions(points) {
    const arr = [];
    for (const p of points) arr.push(p.x, p.y, p.z);
    return arr;
  }

  // Замкнутая линия через массив точек (Line2)
  function makeLine(points) {
    const geo = new THREE.LineGeometry();
    geo.setPositions(toPositions(points));
    return new THREE.Line2(geo, lineMat);
  }

  // Набор отрезков [p0,p1, p2,p3, ...] (LineSegments2)
  function makeSegments(points) {
    const geo = new THREE.LineSegmentsGeometry();
    geo.setPositions(toPositions(points));
    return new THREE.LineSegments2(geo, lineMat);
  }

  // EdgesGeometry → LineSegments2
  function wire(geo) {
    const edges = new THREE.EdgesGeometry(geo);
    const pos = edges.attributes.position.array;
    const segsGeo = new THREE.LineSegmentsGeometry();
    segsGeo.setPositions(pos);
    return new THREE.LineSegments2(segsGeo, lineMat);
  }

  // Горизонтальная окружность
  function circle(r, segs, y) {
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    return makeLine(pts);
  }

  // Вертикальная линия
  function vline(x, y1, y2, z) {
    return makeSegments([
      new THREE.Vector3(x, y1, z),
      new THREE.Vector3(x, y2, z)
    ]);
  }

  const model = new THREE.Group();

  // ════════════════════════════════════════════════
  // Параметры
  // ════════════════════════════════════════════════
  const outerR = 6;
  const wallH = 2.5;
  const wallSegs = 48;
  const towerR = 0.9;
  const towerH = 5.5;
  const towerSegs = 12;
  const cellCount = 12;
  const Y0 = 0;
  const Y1 = wallH;
  const TY1 = towerH;

  // ════════════════════════════════════════════════
  // OUTER WALL
  // ════════════════════════════════════════════════
  const wallGeo = new THREE.CylinderGeometry(
    outerR,
    outerR,
    wallH,
    wallSegs,
    1,
    true
  );
  const wallMesh = wire(wallGeo);
  wallMesh.position.y = wallH / 2;
  model.add(wallMesh);

  model.add(circle(outerR, wallSegs, Y1));
  model.add(circle(outerR, wallSegs, Y0));

  // ════════════════════════════════════════════════
  // CELLS — 12 радиальных перегородок
  // ════════════════════════════════════════════════
  const cellDepth = outerR - towerR;
  const midR = towerR + cellDepth / 2;

  for (let i = 0; i < cellCount; i++) {
    const angle = (i / cellCount) * Math.PI * 2;
    const wallCell = wire(new THREE.PlaneGeometry(cellDepth, wallH));
    wallCell.position.set(
      Math.cos(angle) * midR,
      wallH / 2,
      Math.sin(angle) * midR
    );
    wallCell.rotation.y = -angle;
    model.add(wallCell);
  }

  // ════════════════════════════════════════════════
  // FLOOR
  // ════════════════════════════════════════════════
  model.add(circle(towerR, towerSegs, Y0));

  for (let i = 0; i < cellCount; i++) {
    const angle = (i / cellCount) * Math.PI * 2;
    model.add(
      makeSegments([
        new THREE.Vector3(
          Math.cos(angle) * towerR,
          Y0,
          Math.sin(angle) * towerR
        ),
        new THREE.Vector3(
          Math.cos(angle) * outerR,
          Y0,
          Math.sin(angle) * outerR
        )
      ])
    );
  }

  // ════════════════════════════════════════════════
  // TOWER
  // ════════════════════════════════════════════════
  const towerGeo = new THREE.CylinderGeometry(
    towerR,
    towerR,
    towerH,
    towerSegs,
    1,
    true
  );
  const towerMesh = wire(towerGeo);
  towerMesh.position.y = towerH / 2;
  model.add(towerMesh);

  model.add(circle(towerR, towerSegs, Y0));
  model.add(circle(towerR, towerSegs, Y1));
  model.add(circle(towerR, towerSegs, TY1));

  // ════════════════════════════════════════════════
  // ROOF
  // ════════════════════════════════════════════════
  const roofH = 2.5;
  const eaveR = towerR * 1.5;
  const eaveH = TY1;

  const roofGeo = new THREE.ConeGeometry(eaveR, roofH, towerSegs);
  const roofMesh = wire(roofGeo);
  roofMesh.position.y = TY1 + roofH / 2;
  model.add(roofMesh);

  model.add(circle(eaveR, towerSegs, eaveH));

  // ════════════════════════════════════════════════
  scene.add(model);

  // ─── Авто-вращение ───
  let autoRotate = true;
  controls.addEventListener('start', () => {
    autoRotate = false;
  });
  controls.addEventListener('end', () => {
    autoRotate = true;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) model.rotation.y += 0.003;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ─── Ресайз ───
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    lineMat.resolution.set(w, h); // обязательно для Line2
  });
  ro.observe(container);
}
