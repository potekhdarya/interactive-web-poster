let threeInitialized = false;
let soundInitialized = false;
let diagInitialized = false;
let trackingInitialized = false;

function showPage(id) {
  document
    .querySelectorAll('.page')
    .forEach((p) => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');

  if (id === 'main' && !threeInitialized) {
    threeInitialized = true;
    initThree();
  }
  if (id === 'sound' && !soundInitialized) {
    soundInitialized = true;
    initSound();
  }
  if (id === 'diagnostics' && !diagInitialized) {
    diagInitialized = true;
    initThreshold();
    initDiagForm();
  }
  if (id === 'test' && !trackingInitialized) {
    trackingInitialized = true;
    initTracking();
  }
  if (id === 'journal') {
    loadJournal();
  }
}

window.addEventListener('load', () => {
  showPage('main');
  updateTime();
  setInterval(updateTime, 1000);
});
