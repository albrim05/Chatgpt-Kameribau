document.getElementById('inquiry')?.addEventListener('submit', (event) => {
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
  if (motionPreference.matches || document.documentElement.classList.contains('motion-paused') || !('IntersectionObserver' in window)) return;
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


// Accessible mobile navigation; anchors remain usable without JavaScript.
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
if (menuButton && mainNav) {
  menuButton.hidden = false;
  document.documentElement.classList.add('navigation-ready');
  function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mainNav.classList.toggle('is-open', open);
  });
  mainNav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => closeMenu());
}

const header = document.querySelector('.header');
const headerObserver = new IntersectionObserver(entries => {
  header?.classList.toggle('is-scrolled', !entries[0].isIntersecting);
});
const headerSentinel = document.createElement('div');
headerSentinel.className = 'header-sentinel';
headerSentinel.setAttribute('aria-hidden', 'true');
header?.before(headerSentinel);
headerObserver.observe(headerSentinel);

const sections = [...document.querySelectorAll('section[id]')];
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  document.querySelectorAll('#main-nav a').forEach(link => {
    if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-120px 0px -35% 0px', threshold: [0, 0.2, 0.5] });
sections.forEach(section => sectionObserver.observe(section));


// Ambient motion has one explicit pause control and follows device preferences.
const motionToggle = document.querySelector('.motion-toggle');
let manuallyPaused = false;
function motionIsActive() {
  return !motionPreference.matches && !manuallyPaused && !document.hidden;
}
function syncAmbientMotion() {
  const active = !motionPreference.matches && !manuallyPaused;
  document.documentElement.classList.toggle('motion-enabled', active);
  document.documentElement.classList.toggle('motion-paused', !active);
  if (motionToggle) {
    motionToggle.hidden = false;
    motionToggle.disabled = motionPreference.matches;
    motionToggle.setAttribute('aria-pressed', String(!active));
    motionToggle.textContent = motionPreference.matches
      ? 'Bewegung reduziert'
      : manuallyPaused ? 'Animationen starten' : 'Animationen pausieren';
  }
  if (!active) {
    document.querySelector('.hero-image-layer')?.style.removeProperty('--scene-y');
    document.querySelectorAll('.service-drawing').forEach(drawing => {
      drawing.style.removeProperty('--tilt-x');
      drawing.style.removeProperty('--tilt-y');
    });
  }
  setupMotion();
}
motionToggle?.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  syncAmbientMotion();
});
motionPreference.addEventListener('change', syncAmbientMotion);
syncAmbientMotion();

// Scroll transforms stay on a separate layer from the image's slow zoom.
const heroScene = document.querySelector('.hero-image-layer');
const heroSection = document.querySelector('.hero');
const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let sceneFramePending = false;
function updateScene() {
  sceneFramePending = false;
  if (!heroScene || !heroSection || !motionIsActive()) return;
  const rect = heroSection.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
  const strength = desktopPointer.matches ? 0.13 : 0.05;
  const shift = Math.max(-40, Math.min(65, -rect.top * strength));
  heroScene.style.setProperty('--scene-y', `${shift.toFixed(2)}px`);
}
window.addEventListener('scroll', () => {
  if (!sceneFramePending && motionIsActive()) {
    sceneFramePending = true;
    window.requestAnimationFrame(updateScene);
  }
}, { passive: true });
window.addEventListener('resize', updateScene);
updateScene();

// Only the decorative diagram responds to a mouse; reading and links stay still.
document.querySelectorAll('.service-grid .service').forEach(card => {
  const drawing = card.querySelector('.service-drawing');
  card.querySelectorAll('.service-drawing path').forEach(path => path.setAttribute('pathLength', '1'));
  card.addEventListener('pointermove', event => {
    if (!motionIsActive() || !desktopPointer.matches || event.pointerType !== 'mouse') return;
    const rect = card.getBoundingClientRect();
    drawing.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 14}deg`);
    drawing.style.setProperty('--tilt-x', `${(0.5 - (event.clientY - rect.top) / rect.height) * 10}deg`);
  });
  card.addEventListener('pointerleave', () => {
    drawing.style.setProperty('--tilt-x', '0deg');
    drawing.style.setProperty('--tilt-y', '0deg');
  });
});
