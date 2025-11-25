// Main interactions: nav smooth scroll + active, reveal on scroll, skill progress animate, modal portfolio

document.addEventListener('DOMContentLoaded', () => {
  // Utilities
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // Smooth scroll for nav links
  const navLinks = $$('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({behavior: 'smooth', block: 'start'});
          // close mobile nav if open
          closeMobileNav();
        }
      }
    });
  });

  // Mobile nav toggle
  const navToggle = $('#nav-toggle');
  const navList = $('#nav-list');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.style.display = expanded ? '' : 'flex';
  });
  function closeMobileNav(){
    if (window.innerWidth <= 640 && navToggle) {
      navToggle.setAttribute('aria-expanded','false');
      if (navList) navList.style.display = 'none';
    }
  }

  // Active nav item when scrolling (IntersectionObserver)
  const sections = $$('main > section, main > div');
  const observerOptions = {root: null, rootMargin: '0px 0px -40% 0px', threshold: 0};
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, observerOptions);
  sections.forEach(s => sectionObserver.observe(s));

  // Reveal on scroll for elements with .reveal
  const reveals = $$('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  reveals.forEach(r => revealObserver.observe(r));

  // Skills progress bars: animate when skills section enters viewport
  const skillsSection = $('#skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          const skillEls = $$('.skill');
          skillEls.forEach(skill => {
            const percent = skill.dataset.percent || '0';
            const bar = skill.querySelector('.progress-bar');
            if (bar) {
              // pulse animation & set width
              setTimeout(() => bar.style.width = percent + '%', 120);
            }
          });
          obs.unobserve(ent.target);
        }
      });
    }, {threshold: 0.2});
    skillsObserver.observe(skillsSection);
  }

  // Portfolio modal logic (populate from data- attributes)
  const portItems = $$('.port-item');
  const modal = $('#portfolio-modal');
  const modalBackdrop = $('#modal-backdrop');
  const modalPanel = document.querySelector('.modal-panel');
  const modalClose = $('#modal-close');
  const modalTitle = $('#modal-title');
  const modalDesc = $('#modal-desc');
  const modalTech = $('#modal-tech');
  const modalMedia = $('#modal-media');

  let lastFocusedEl = null;

  portItems.forEach(item => {
    const open = () => {
      lastFocusedEl = document.activeElement;
      const title = item.dataset.title || 'Project';
      const desc = item.dataset.desc || '';
      const tech = item.dataset.tech || '';
      const media = item.dataset.media || '';
      const mediaType = item.dataset.mediaType || 'image';

      // populate
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modalTech.textContent = 'Technology: ' + tech;

      // clear media
      modalMedia.innerHTML = '';
      if (media) {
        if (mediaType === 'video') {
          const vid = document.createElement('video');
          vid.controls = true;
          vid.src = media;
          vid.setAttribute('aria-label', title + ' video');
          modalMedia.appendChild(vid);
        } else {
          const img = document.createElement('img');
          img.src = media;
          img.alt = title;
          modalMedia.appendChild(img);
        }
      }

      // show modal
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      // focus management
      modalClose.focus();
      document.body.style.overflow = 'hidden';
    };

    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  modalBackdrop?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Click outside modal-panel closes as well (safe fallback)
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // small helper: set copyright year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ensure focus ring visible for keyboard navigation
  document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') document.documentElement.classList.add('user-is-tabbing');
  });
});