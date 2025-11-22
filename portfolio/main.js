// Translations
const translations = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navProjects: 'Projects',
    navTrailers: 'Trailers',
    tagline: 'Front-End Developer & Trailer maker',
    heroLocation: 'Québec, Canada',
    aboutGreeting: 'Hey there! 👋',
    aboutTitle: "I'm Galaxy",
    aboutText1: "I'm a front-end web developer based in Québec, Canada.",
    aboutText2: "When I'm not coding, I play games.",
    aboutText3:
      'I started coding in early 2019. Each project teaches me something new.',
    projectsTitle: 'My Projects',
    trailersTitle: 'My Trailers',
    repviewerDesc: 'Recipes viewer for Windows',
    ichatDesc: 'Chat that is open-source',
    clockDesc: 'Clock',
    trailer1Title: 'Gens Setup trailer',
    trailer1Desc: 'Preminum server setup trailer made for Olangus studio.',
    trailer2Title: 'Bedwars',
    trailer2Desc:
      'Simple spectator view filmed with replaymod edited on filmora 11.',
  },
  fr: {
    navHome: 'Accueil',
    navAbout: 'À propos',
    navProjects: 'Projets',
    navTrailers: 'Trailers',
    tagline: 'Développeur Web Front-End & Créateur de trailers',
    heroLocation: 'Québec, Canada',
    aboutGreeting: 'Salut! 👋',
    aboutTitle: 'Je suis Galaxy',
    aboutText1: 'Je suis un développeur web front-end basé au Québec, Canada..',
    aboutText2: 'Quand je ne code pas, je joue à des jeux.',
    aboutText3:
      "J'ai commencé le développement au début de 2019. Chaque projet ma apprend un nouvelle chose.",
    projectsTitle: 'Mes Projets',
    trailersTitle: 'Mes Trailers',
    repviewerDesc: 'Visionneuse de recettes pour Windows',
    ichatDesc: 'Chat open-source',
    clockDesc: 'Horloge',
    trailer1Title: 'Trailer Gens Setup',
    trailer1Desc: 'Trailer de setup premium réalisé pour Olangus Studio.',
    trailer2Title: 'Bedwars',
    trailer2Desc:
      'Vue de spectateur simple filmée avec ReplayMod et montée sur Filmora 11.',
  },
};

// Detect browser language and set automatically
let currentLang = 'en';
const browserLang = navigator.language || navigator.userLanguage;
if (browserLang.startsWith('fr')) {
  currentLang = 'fr';
}

function setLanguage(lang) {
  currentLang = lang;

  // Update button states
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });

  // Update all translatable elements
  document.querySelectorAll('[data-translate]').forEach((el) => {
    const key = el.getAttribute('data-translate');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// Clock functionality
function updateClock() {
  // Quebec time (EST/EDT - America/Toronto timezone)
  const quebecTime = new Date().toLocaleString('en-US', {
    timeZone: 'America/Toronto',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  document.getElementById('heroTime').textContent = quebecTime;
}

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  lastScroll = currentScroll;

  // Update active nav link
  const sections = document.querySelectorAll('section[id]');
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (
      currentScroll >= sectionTop &&
      currentScroll < sectionTop + sectionHeight
    ) {
      document.querySelectorAll('.navbar-links a').forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
});

// Smooth scroll for navbar links
document.querySelectorAll('.navbar-links a').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Update age and clock
updateClock();
setInterval(updateClock, 1000);

// Initialize language on page load
setLanguage(currentLang);

// Smooth scroll on click
document.querySelector('.scroll-indicator').addEventListener('click', () => {
  document
    .querySelector('.about-section')
    .scrollIntoView({ behavior: 'smooth' });
});

// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe about section
observer.observe(document.querySelector('.about-content'));
observer.observe(document.querySelector('.about-image-container'));

// Observe section titles
document.querySelectorAll('.section-title').forEach((title) => {
  observer.observe(title);
});

// Observe project cards with stagger effect
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 0.2}s`;
  observer.observe(card);
});

// Observe trailer cards with stagger effect
const trailerCards = document.querySelectorAll('.trailer-card');
trailerCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 0.2}s`;
  observer.observe(card);
});

// ===== Scroll lock for 6 seconds =====
(function () {
  if (window.scrollY != 0) {
    return;
  }
  // Always scroll to top
  window.scrollTo(0, 0);

  // Lock overflow
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Block all scroll methods (desktop + mobile + iOS)
  function blockScroll(e) {
    e.preventDefault();
  }

  window.addEventListener('wheel', blockScroll, { passive: false });
  window.addEventListener('touchmove', blockScroll, { passive: false });
  window.addEventListener('keydown', blockScroll, { passive: false });

  // Unlock after 6 seconds
  setTimeout(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    window.removeEventListener('wheel', blockScroll, { passive: false });
    window.removeEventListener('touchmove', blockScroll, { passive: false });
    window.removeEventListener('keydown', blockScroll, { passive: false });
  }, 3000);
})();
