function toggleBurger(btn) {
  btn.classList.toggle('open');
  btn.nextElementSibling.classList.toggle('open');
}
function closeBurger() {
  document.querySelectorAll('.burgerBtn.open').forEach((b) => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navBar')) closeBurger();
});
