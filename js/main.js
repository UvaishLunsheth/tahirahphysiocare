// main.js — Tahirah PhysioCare (mobile-first, accessible, lazy-GSAP)
// - Lazy-loads GSAP & ScrollTrigger only when appropriate
// - Accessible hamburger/mobile menu (non-blocking)
// - Testimonial slider (lightweight, safe)
// - Gallery lightbox (keyboard accessible)
// - FAQ accordion (single-open behaviour)
// - No body overflow locking; menu & overlays are scrollable on mobile

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Utilities
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Focus helper used for accessibility
  function trapFocus(container) {
    const focusable = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handle(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', handle);
    return () => container.removeEventListener('keydown', handle);
  }

  onReady(() => {
    /* --------------------------
       Mobile nav (hamburger)
       -------------------------- */
    const hamburger = $('#hamburger');
    const navMenu = $('#nav-menu');

    if (hamburger && navMenu) {
      // Ensure ARIA state
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-controls', 'nav-menu');

      let removeTrap = null;

      function openMenu() {
        navMenu.classList.add('show');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        // set focus to first link for keyboard users
        const firstLink = navMenu.querySelector('a, button');
        if (firstLink) firstLink.focus();
        // trap focus inside navMenu while open (improves a11y)
        removeTrap = trapFocus(navMenu);
      }

      function closeMenu() {
        navMenu.classList.remove('show');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (removeTrap) { removeTrap(); removeTrap = null; }
        hamburger.focus();
      }

      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains('show')) closeMenu();
        else openMenu();
      });

      // Close when clicking a nav link (allows normal navigation)
      navMenu.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a) closeMenu();
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('show')) closeMenu();
      });

      // Close when clicking outside nav
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
          if (navMenu.classList.contains('show')) closeMenu();
        }
      });

      // Ensure menu closed when resizing to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && navMenu.classList.contains('show')) closeMenu();
      }, { passive: true });
    }

    /* --------------------------
       Testimonial slider (safe, no deps)
       -------------------------- */
    (function initSlider() {
      const track = document.querySelector('.slider-track');
      const slides = document.querySelectorAll('.slide');
      const dotsContainer = document.querySelector('.slider-dots');

      if (!track || !slides.length || !dotsContainer) return;

      let idx = 0;
      let timer = null;
      const SLIDE_INTERVAL = 5000;

      // build dots
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', `Show slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goto(i));
        dotsContainer.appendChild(dot);
      });

      const dots = Array.from(dotsContainer.children);

      function goto(i) {
        idx = i;
        track.style.transform = `translateX(-${i * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[i].classList.add('active');
      }

      function start() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          idx = (idx + 1) % slides.length;
          goto(idx);
        }, SLIDE_INTERVAL);
      }

      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
      }

      // Pause slider when tab hidden
      document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
      });

      // Pause on focus in slider area for better accessibility
      track.addEventListener('mouseenter', stop);
      track.addEventListener('mouseleave', start);
      track.addEventListener('focusin', stop);
      track.addEventListener('focusout', start);

      start();
    })();

    /* --------------------------
       Gallery lightbox
       -------------------------- */
    (function initLightbox() {
      const galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img'));
      if (!galleryImgs.length) return;

      // Create lightbox markup if not present
      let lightbox = $('#lightbox');
      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.innerHTML = `
          <button class="close-lightbox" aria-label="Close image" type="button">&times;</button>
          <img id="lightbox-img" alt="">
        `;
        document.body.appendChild(lightbox);
      }

      const lightboxImg = $('#lightbox-img');
      const closeLightbox = lightbox.querySelector('.close-lightbox');

      function open(img) {
        lightbox.classList.add('open');
        lightboxImg.src = img.dataset.large || img.src;
        lightboxImg.alt = img.alt || '';
        closeLightbox.focus();
      }
      function close() {
        lightbox.classList.remove('open');
        // clear src for memory
        lightboxImg.src = '';
      }

      galleryImgs.forEach(img => {
        img.setAttribute('tabindex', '0');
        img.addEventListener('click', () => open(img));
        img.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(img); });
      });

      closeLightbox.addEventListener('click', close);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    })();

    /* --------------------------
       FAQ accordion (single open)
       -------------------------- */
    (function initFAQ() {
      const faqItems = Array.from(document.querySelectorAll('.faq-item'));
      if (!faqItems.length) return;

      faqItems.forEach(item => {
        const q = item.querySelector('.faq-question');
        const a = item.querySelector('.faq-answer');
        if (!q || !a) return;

        // Make question button keyboard accessible if not a button
        if (q.tagName.toLowerCase() !== 'button') {
          const btn = document.createElement('button');
          btn.className = 'faq-question';
          btn.innerHTML = q.innerHTML;
          q.parentNode.replaceChild(btn, q);
        }

        const questionBtn = item.querySelector('.faq-question');

        questionBtn.addEventListener('click', () => {
          const open = item.classList.contains('active');
          // close others
          faqItems.forEach(other => {
            if (other !== item) {
              other.classList.remove('active');
              const oa = other.querySelector('.faq-answer');
              if (oa) oa.style.maxHeight = null;
            }
          });

          if (!open) {
            item.classList.add('active');
            a.style.maxHeight = a.scrollHeight + 'px';
            questionBtn.setAttribute('aria-expanded', 'true');
          } else {
            item.classList.remove('active');
            a.style.maxHeight = null;
            questionBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // ensure initial collapsed state
        questionBtn.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = null;
      });
    })();

    /* --------------------------
       Lazy-load GSAP for tasteful reveals (if allowed)
       -------------------------- */
    if (!prefersReducedMotion) {
      (function lazyLoadGSAP() {
        // double-check we haven't already loaded
        if (window.gsap) return runGsap();
        // small viewport heuristic: skip on very low-powered devices
        const isLowPower = navigator.deviceMemory && navigator.deviceMemory <= 1;
        if (isLowPower) return;

        const s1 = document.createElement('script');
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        s1.async = true;
        s1.onload = () => {
          const s2 = document.createElement('script');
          s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
          s2.async = true;
          s2.onload = runGsap;
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);

        function runGsap() {
          try {
            if (!window.gsap) return;
            const gsap = window.gsap;
            const ScrollTrigger = window.ScrollTrigger;
            if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

            // header reveal
            const header = document.querySelector('.header');
            if (header) gsap.from(header, { opacity: 0, y: -16, duration: 0.6, ease: 'power2.out' });

            // hero content
            const heroLeft = document.querySelector('.hero-left');
            if (heroLeft) gsap.from(heroLeft.children, { opacity: 0, y: 22, stagger: 0.08, duration: 0.6, ease: 'power3.out' });

            // card reveals
            const revealEls = document.querySelectorAll('.section-title, .treatment-card, .approach-card, .contact-card, .slide');
            revealEls.forEach(el => {
              gsap.from(el, {
                opacity: 0,
                y: 28,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
              });
            });
          } catch (err) {
            // silent fail
            console.warn('GSAP init error', err);
          }
        }
      })();
    }

  }); // onReady end

})(); // IIFE end

/* ===============================
   TYPEWRITER FOR SERVICE AREAS
   =============================== */

const locations = [
  "Bharuch",
  "Ankleshwar",
  "Dahej",
  "Vadodara",
  "Surat"
];

let index = 0;
let charIndex = 0;
const typeTarget = document.getElementById("typewriter");

function typeLocation() {
  if (!typeTarget) return;

  if (charIndex < locations[index].length) {
    typeTarget.innerHTML = locations[index].slice(0, charIndex + 1) + "<span class='cursor'>|</span>";
    charIndex++;
    setTimeout(typeLocation, 90);
  } else {
    setTimeout(() => {
      typeTarget.innerHTML = locations[index] + "<span class='cursor'>|</span>";
      setTimeout(eraseLocation, 1200);
    }, 300);
  }
}

function eraseLocation() {
  if (charIndex > 0) {
    typeTarget.innerHTML = locations[index].slice(0, charIndex - 1) + "<span class='cursor'>|</span>";
    charIndex--;
    setTimeout(eraseLocation, 70);
  } else {
    index = (index + 1) % locations.length;
    setTimeout(typeLocation, 200);
  }
}

typeLocation();

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Fade Up
  gsap.utils.toArray(".fade-up").forEach(item => {
    gsap.from(item, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // Fade Left
  gsap.utils.toArray(".fade-left").forEach(item => {
    gsap.from(item, {
      opacity: 0,
      x: -60,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // Fade Right
  gsap.utils.toArray(".fade-right").forEach(item => {
    gsap.from(item, {
      opacity: 0,
      x: 60,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });
});

/* ===========================
   COUNTER ANIMATION
   =========================== */
function animateCounter(el) {
  const target = +el.dataset.count;
  const duration = 1800;
  let start = 0;

  const increment = target / (duration / 16);

  function update() {
    start += increment;

    if (start < target) {
      el.textContent = Math.floor(start);
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString(); // add commas for 10,000+
    }
  }

  update();
}

// Trigger when visible (ScrollTrigger)
gsap.utils.toArray("[data-count]").forEach((counter) => {
  ScrollTrigger.create({
    trigger: counter,
    start: "top 85%",
    onEnter: () => animateCounter(counter),
  });
});

gsap.utils.toArray(".fade-up").forEach(el => {
  gsap.from(el, {
    opacity: 0,
    y: 40,
    duration: 0.7,
    scrollTrigger: {
      trigger: el,
      start: "top 85%"
    }
  });
});
