// =====================================================
// Tahirah PhysioCare — Clean & Optimized main.js (v3.0)
// All bugs fixed: scrolling lag, double hamburger logic,
// click conflicts, animation conflicts.
// =====================================================

(function () {

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // =====================================================
  // 1) CLEAN HAMBURGER MENU — dropdown only (no fullscreen)
  // =====================================================
  document.addEventListener("DOMContentLoaded", () => {

    const hamburger = $("#hamburger");
    const navMenu = $("#nav-menu");
    const closeBtn = $("#menuCloseBtn");

    if (!hamburger || !navMenu || !closeBtn) return;

    // OPEN dropdown
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.add("show");
      closeBtn.classList.remove("hidden");
      hamburger.classList.add("active");
    });

    // CLOSE dropdown
    closeBtn.addEventListener("click", () => {
      navMenu.classList.remove("show");
      closeBtn.classList.add("hidden");
      hamburger.classList.remove("active");
    });

    // Close when clicking any menu link
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navMenu.classList.remove("show");
        closeBtn.classList.add("hidden");
        hamburger.classList.remove("active");
      }
    });

    // Close if clicking OUTSIDE menu
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove("show");
        closeBtn.classList.add("hidden");
        hamburger.classList.remove("active");
      }
    });

  });

  // =====================================================
  // 2) TESTIMONIAL SLIDER — optimised & smooth
  // =====================================================

  const track = $(".slider-track");
  const slides = $$(".slide");
  const dotsContainer = $(".slider-dots");

  if (track && slides.length && dotsContainer) {
    let index = 0;
    let autoSlide;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => moveTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = $$(".slider-dots span");

    function moveTo(i) {
      index = i;
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d) => d.classList.remove("active"));
      dots[i].classList.add("active");
    }

    function startSlider() {
      autoSlide = setInterval(() => {
        index = (index + 1) % slides.length;
        moveTo(index);
      }, 5000);
    }

    function stopSlider() {
      clearInterval(autoSlide);
    }

    // CPU saver when tab inactive
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopSlider() : startSlider();
    });

    startSlider();
  }

  // =====================================================
  // 3) GALLERY LIGHTBOX — stable & smooth
  // =====================================================

  const galleryImgs = $$(".gallery-grid img");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightbox-img");
  const closeLightbox = $(".close-lightbox");

  if (galleryImgs.length && lightbox && lightboxImg && closeLightbox) {
    galleryImgs.forEach((img) => {
      img.addEventListener("click", () => {
        lightbox.classList.add("open");
        lightboxImg.src = img.src;
      });
    });

    closeLightbox.addEventListener("click", () =>
      lightbox.classList.remove("open")
    );

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  // =====================================================
  // 4) FAQ ACCORDION — smooth height animation
  // =====================================================

  const faqItems = $$(".faq-item");

  if (faqItems.length) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      if (!question || !answer) return;

      question.addEventListener("click", () => {
        // Close all
        faqItems.forEach((i) => {
          if (i !== item) {
            i.classList.remove("active");
            const a = i.querySelector(".faq-answer");
            if (a) a.style.maxHeight = null;
          }
        });

        // Toggle selected
        const isOpen = item.classList.contains("active");
        item.classList.toggle("active");

        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight = null;
        }
      });
    });
  }

  // =====================================================
  // 5) Lazy-load GSAP ONLY if animations allowed
  // =====================================================

  if (prefersReducedMotion) return;

  function loadGSAP() {
    return new Promise((resolve) => {
      if (window.gsap) return resolve(window.gsap);

      const core = document.createElement("script");
      core.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

      const trig = document.createElement("script");
      trig.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";

      core.onload = () => {
        trig.onload = () => resolve(window.gsap);
        document.head.appendChild(trig);
      };

      document.head.appendChild(core);
    });
  }

  // =====================================================
  // 6) GSAP Animations — safe, smooth, lightweight
  // =====================================================

  loadGSAP().then((gsap) => {
    gsap.registerPlugin(window.ScrollTrigger);

    // Header
    gsap.from(".header", {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: "power2.out",
    });

    // Hero content
    gsap.from(".hero-left > *", {
      opacity: 0,
      y: 25,
      stagger: 0.1,
      duration: 0.7,
      ease: "power3.out",
    });

    // Hero image
    gsap.from(".hero-right img", {
      opacity: 0,
      scale: 0.95,
      duration: 0.75,
      ease: "power3.out",
    });

    // Section reveals
    $$(".section-title, .treatment-card, .contact-card, .slide").forEach(
      (el) => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      }
    );

    // Treatment hover pop
    $$(".treatment-card").forEach((card) => {
      card.addEventListener("mouseenter", () =>
        gsap.to(card, { scale: 1.04, duration: 0.2 })
      );
      card.addEventListener("mouseleave", () =>
        gsap.to(card, { scale: 1.0, duration: 0.2 })
      );
    });

    // Footer
    gsap.from("footer", {
      opacity: 0,
      y: 20,
      duration: 0.7,
      scrollTrigger: {
        trigger: "footer",
        start: "top 95%",
      },
    });
  });

})();
