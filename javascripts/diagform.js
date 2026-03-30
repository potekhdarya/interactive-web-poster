function initDiagForm() {
  const diagForm = document.getElementById('diagForm');
  const diagClear = document.getElementById('diagClear');
  const diagTrack = document.querySelector('.diagSliderTrack');
  const diagThumb = document.querySelector('.diagSliderThumb');
  const diagValue = document.querySelector('.diagSliderValue');

  if (diagTrack && diagThumb && diagValue) {
    let dragging = false;
    diagTrack.addEventListener('mousedown', (e) => {
      dragging = true;
      moveSlider(e);
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) moveSlider(e);
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
    });
    function moveSlider(e) {
      const bounds = diagTrack.getBoundingClientRect();
      let pct = (e.clientX - bounds.left) / bounds.width;
      pct = Math.max(0, Math.min(1, pct));
      diagThumb.style.left = pct * 100 + '%';
      diagValue.textContent = Math.round(1 + pct * 9);
    }
  }

  if (diagClear) {
    diagClear.addEventListener('click', () => {
      if (diagForm) diagForm.reset();
      if (diagThumb) diagThumb.style.left = '40%';
      if (diagValue) diagValue.textContent = '5';
    });
  }

  if (diagForm) {
    diagForm.addEventListener('submit', (e) => {
      e.preventDefault();
      diagForm.style.display = 'none';

      // Берём персональный ID из localStorage — тот же что на странице теста
      const id = getPersonalId();

      const modal = document.getElementById('idModal');
      const codeEl = document.getElementById('idModalCode');
      const okBtn = document.getElementById('idModalOk');

      codeEl.textContent = '';
      modal.classList.add('visible');

      let i = 0;
      function typeNext() {
        if (i < id.length) {
          codeEl.textContent = id.slice(0, i + 1);
          i++;
          setTimeout(typeNext, 120);
        }
      }
      setTimeout(typeNext, 300);

      okBtn.onclick = () => showPage('test');
    });
  }

  // Перетаскивание окон
  function makeWindowDraggable(el) {
    const mRect = document.querySelector('#page-diagnostics .mainRect');
    let startX, startY, startLeft, startTop;
    el.addEventListener('mousedown', (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('.diagSliderTrack') ||
        e.target.closest('.diagSliderThumb')
      )
        return;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = el.offsetLeft;
      startTop = el.offsetTop;
      el.style.cursor = 'grabbing';
      function onMove(e) {
        if (!mRect) return;
        const rb = mRect.getBoundingClientRect();
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
      }
      function onUp() {
        el.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
    el.style.cursor = 'grab';
  }

  const diagFormEl = document.getElementById('diagForm');
  const idModalBox = document.querySelector('.idModalBox');
  if (diagFormEl) makeWindowDraggable(diagFormEl);
  if (idModalBox) makeWindowDraggable(idModalBox);
}

// ─── Общая функция генерации персонального ID ───
// Объявлена глобально чтобы использоваться и в diagform.js и в tracking.js
function getPersonalId() {
  let pid = localStorage.getItem('fw_personal_id');
  if (!pid) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    pid = Array.from(
      { length: 7 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    localStorage.setItem('fw_personal_id', pid);
  }
  return pid;
}
