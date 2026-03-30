function initThreshold() {
  const img = document.getElementById('sourceImg');
  const cvs = document.getElementById('thresholdCanvas');
  if (!img || !cvs) return;

  const ctx = cvs.getContext('2d');
  let threshold = 128;

  function resize() {
    cvs.width = cvs.offsetWidth;
    cvs.height = cvs.offsetHeight;
    drawThreshold(threshold);
  }

  img.addEventListener('load', resize);
  if (img.complete) resize();
  window.addEventListener('resize', resize);

  cvs.addEventListener('mousemove', (e) => {
    const rect = cvs.getBoundingClientRect();
    threshold = Math.round(((e.clientX - rect.left) / rect.width) * 255);
    drawThreshold(threshold);
  });

  cvs.addEventListener('mouseleave', () => {
    threshold = 128;
    drawThreshold(threshold);
  });

  function drawThreshold(t) {
    if (!img.complete || cvs.width === 0) return;
    const cw = cvs.width,
      ch = cvs.height;
    const iw = img.naturalWidth,
      ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale,
      sh = ih * scale;
    const sx = (cw - sw) / 2,
      sy = (ch - sh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
    const imageData = ctx.getImageData(0, 0, cw, ch);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const brightness =
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = brightness >= t ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
