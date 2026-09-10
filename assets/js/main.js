document.documentElement.classList.add('js');

const button = document.querySelector('[data-menu]');
const nav = document.querySelector('[data-nav]');
button?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open'); button?.setAttribute('aria-expanded', 'false');
}));
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
