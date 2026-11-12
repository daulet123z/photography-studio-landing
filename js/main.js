/* ==========================================================================
   Aster Vale Photography — main.js (no dependencies)

   Tailwind is CSS only, so interactive parts live here:
   1. Mobile menu
   2. Portfolio filter
   3. "Book a session" buttons pre-select the session type
   4. Contact form validation
   5. Reveal-on-scroll animation
   6. Footer year

   Note: Tailwind only generates classes it finds in the source files.
   This file only toggles `hidden` and `is-visible`, which exist in
   index.html / src/input.css, so they're always in the built CSS.
   ========================================================================== */
(() => {
  'use strict';

  /* 1. Mobile menu
     ------------------------------------------------------------------------ */
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const desktop = window.matchMedia('(min-width: 1024px)'); // Tailwind's lg breakpoint

  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  desktop.addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* 2. Portfolio filter
     ------------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('#gallery [data-category]');
  const galleryStatus = document.getElementById('gallery-status');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      let shown = 0;
      items.forEach((item) => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
        if (match) shown += 1;
      });
      // Announce the result for screen reader users
      galleryStatus.textContent = filter === 'all'
        ? `Showing all ${shown} photos`
        : `Showing ${shown} ${filter} photos`;
    });
  });

  /* 3. Pre-select the session type from a package button
     ------------------------------------------------------------------------ */
  const sessionSelect = document.getElementById('session');
  document.querySelectorAll('[data-session]').forEach((link) => {
    link.addEventListener('click', () => {
      sessionSelect.value = link.dataset.session;
    });
  });

  /* 4. Contact form validation
     The .field class turns the border red when aria-invalid="true"
     (Tailwind's aria-[invalid=true]: variant in src/input.css).
     ------------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Each rule returns an error message, or '' when the value is fine
  const rules = {
    name: (v) => (!v ? 'Please enter your name.' : v.length < 2 ? 'Name should be at least 2 characters.' : ''),
    email: (v) => (!v ? 'Please enter your email.' : !EMAIL.test(v) ? 'Please enter a valid email, e.g. name@example.com.' : ''),
    session: (v) => (!v ? 'Please choose a session type.' : ''),
    message: (v) => (!v ? 'Please tell me a little about your plans.' : v.length < 10 ? 'Please add a bit more detail (at least 10 characters).' : ''),
  };
  const fields = Object.keys(rules).map((name) => form.elements.namedItem(name));

  function validate(field) {
    const error = rules[field.name](field.value.trim());
    field.setAttribute('aria-invalid', String(Boolean(error)));
    document.getElementById(`${field.id}-error`).textContent = error;
    return !error;
  }

  fields.forEach((field) => {
    // Check after leaving a filled field, then live once it's marked invalid
    field.addEventListener('blur', () => {
      if (field.value.trim()) validate(field);
    });
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';

    const firstInvalid = fields.filter((field) => !validate(field))[0];
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Demo only: nothing is sent. See README to connect Netlify Forms or Formspree.
    const firstName = form.elements.namedItem('name').value.trim().split(/\s+/)[0];
    status.textContent = `Thank you, ${firstName}! I'll get back to you within one business day.`;
    form.reset();
    fields.forEach((field) => field.removeAttribute('aria-invalid'));
  });

  /* 5. Reveal on scroll
     ------------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* 6. Footer year
     ------------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
