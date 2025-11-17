// =====================================================
// Tahirah PhysioCare — Final main.js (Option A, GSAP kept)
// Single tidy file: hamburger dropdown (top), slider,
// lightbox, accordion, GSAP lazy-load. No body overflow.
// =====================================================

(function () {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", () => {
    /* ---------------------------
       Hamburger dropdown (top)
       --------------------------- */
    const hamburger = $("#hamburger");
    const navMenu = $("#nav-menu");
    const closeBtn = $("#menuCloseBtn");

    if (hamburger && navMenu) {
      // ensure ARIA initial state
      hamburger.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("show");

      function openMenu() {
        navMenu.classList.add("show");
        hamburger.classList.add("active");
        hamburger.setAttribute("aria-expanded", "true");
        if (closeBtn) closeBtn.classList.remove("hidden");
        // important: keep body scroll enabled — menu is scrollable itself
      }

      function closeMenu() {
        navMenu.classList.remove("show");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        if (closeBtn) closeBtn.classList.add("hidden");
      }

      hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains("show")) closeMenu();
        else openMenu();
      });

      // close button (optional)
      if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeMenu();
        });
      }

      // close when a nav link clicked (works for anchors)
      navMenu.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a) {
          // allow normal navigation; close UI state
          closeMenu();
        }
      });

      // close when clicking outside header + nav
      document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
          closeMenu();
        }
      });

      // close on ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });

      // if viewport resized above breakpoint, ensure menu removed
      window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) closeMenu();
      }, { passive: true });
    }

    /* ---------------------------
       Testimonial slider (simple, safe)
       --------------------------- */
    const track = $(".slider-track");
    const slides = $$(".slide");
    const dotsContainer = $(".slider-dots");

    if (track && slides.length && dotsContainer) {
      let idx = 0;
      let timer = null;

      // build dots
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goto(i));
        dotsContainer.appendChild(dot);
      });

      const dots = $$(".slider-dots span");

      function goto(i) {
        idx = i;
        track.style.transform = `translateX(-${i * 100}%)`;
        dots.forEach(d => d.classList.remove("active"));
        dots[i].classList.add("active");
      }

      function start() {
        timer = setInterval(() => {
          idx = (idx + 1) % slides.length;
          goto(idx);
        }, 5000);
      }

      function stop() {
        if (timer) { clearInterval(timer); timer = null; }
      }

      document.addEventListener("visibilitychange", () => {
        document.hidden ? stop() : start();
      });

      start();
    }

    /* ---------------------------
       Gallery lightbox
       --------------------------- */
    const galleryImgs = $$(".gallery-grid img");
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightbox-img");
    const closeLightbox = $(".close-lightbox");

    if (galleryImgs.length && lightbox && lightboxImg && closeLightbox) {
      galleryImgs.forEach(img => {
        img.addEventListener("click", () => {
          lightbox.classList.add("open");
          lightboxImg.src = img.src;
          // set focus for accessibility
          closeLightbox.focus();
        });
      });

      closeLightbox.addEventListener("click", () => lightbox.classList.remove("open"));
      lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox.classList.remove("open"); });
    }

    /* ---------------------------
       FAQ accordion
       --------------------------- */
    const faqItems = $$(".faq-item");
    if (faqItems.length) {
      faqItems.forEach(item => {
        const q = item.querySelector(".faq-question");
        const a = item.querySelector(".faq-answer");
        if (!q || !a) return;
        q.addEventListener("click", () => {
          faqItems.forEach(other => {
            if (other !== item) {
              other.classList.remove("active");
              const oa = other.querySelector(".faq-answer");
              if (oa) oa.style.maxHeight = null;
            }
          });
          const open = item.classList.contains("active");
          item.classList.toggle("active");
          if (!open) a.style.maxHeight = a.scrollHeight + "px";
          else a.style.maxHeight = null;
        });
      });
    }
  }); // DOMContentLoaded end

  /* ---------------------------
     GSAP lazy-load & animations
     --------------------------- */
  if (!prefersReducedMotion) {
    function loadGSAP() {
      return new Promise(resolve => {
        if (window.gsap) return resolve(window.gsap);
        const s1 = document.createElement("script");
        s1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
        const s2 = document.createElement("script");
        s2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
        s1.onload = () => {
          s2.onload = () => resolve(window.gsap);
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      });
    }

    loadGSAP().then((gsap) => {
      try {
        gsap.registerPlugin(window.ScrollTrigger);

        // header
        const header = document.querySelector(".header");
        if (header) gsap.from(header, { opacity: 0, y: -18, duration: 0.6, ease: "power2.out" });

        // hero content
        const heroLeft = document.querySelector(".hero-left");
        if (heroLeft) gsap.from(heroLeft.children, { opacity: 0, y: 24, stagger: 0.1, duration: 0.7, ease: "power3.out" });

        // hero image
        const heroImg = document.querySelector(".hero-right img");
        if (heroImg) gsap.from(heroImg, { opacity: 0, scale: 0.96, duration: 0.75, ease: "power3.out" });

        // reveals (lightweight)
        $$(".section-title, .treatment-card, .contact-card, .slide").forEach(el => {
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" }
          });
        });

      } catch (err) {
        // fail silently if gsap causes problems
        console.warn("GSAP init failed:", err);
      }
    }).catch((e) => {
      // ignore loading errors
      console.warn("GSAP load failed:", e);
    });
  }

})(); // IIFE end
