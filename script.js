document.getElementById('inquiry').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `Projektanfrage: ${data.get('service')} in ${data.get('place')}`;
  const body = `Guten Tag Kameri,\n\nich interessiere mich für ${data.get('service')}.\n\nProjektort: ${data.get('place')}\n\n${data.get('message')}\n\nName: ${data.get('name')}\nE-Mail: ${data.get('email')}\n`;
  document.getElementById('form-status').textContent = 'Bitte senden Sie die vorbereitete Anfrage in Ihrem E-Mail-Programm ab. Falls es sich nicht öffnet, schreiben Sie direkt an kameribau@hotmail.com oder rufen Sie uns an.';
  window.location.href = `mailto:kameribau@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Content stays visible without JavaScript or when reduced motion is requested.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
function setupMotion() {
  revealObserver?.disconnect();
  document.querySelectorAll('.reveal').forEach(element => {
    element.classList.remove('reveal', 'is-visible');
    element.style.removeProperty('--reveal-delay');
  });
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .service, .process > .eyebrow, .process > h2, .steps article, .region > *, .contact > div, #inquiry').forEach(element => {
    // Never hide content already on screen when initialization is delayed.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
  document.querySelectorAll('.steps article').forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${index * 100}ms`);
  });
}
setupMotion();
motionPreference.addEventListener('change', setupMotion);

const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
let progressPending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
  progressPending = false;
}
window.addEventListener('scroll', () => {
  if (!progressPending) {
    progressPending = true;
    window.requestAnimationFrame(updateProgress);
  }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
