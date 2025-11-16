// =====================================================
// Tahirah PhysioCare — Optimized main.js (v2.0)
// Faster, safer, unified animations & interactions
// =====================================================

(function () {

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // =====================================================
  // 1) HAMBURGER MENU — improved
  // =====================================================
  document.addEventListener("DOMContentLoaded", () => {
    const hamburger = $("#hamburger");
    const navMenu = $("#nav-menu");

    if (!hamburger || !navMenu) return;

    // Toggle
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("show");
      hamburger.classList.toggle("active");
    });

    // Close when clicking ANY link inside nav
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navMenu.classList.remove("show");
        hamburger.classList.remove("active");
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        navMenu.classList.remove("show");
        hamburger.classList.remove("active");
      }
    });
  });

  // =====================================================
  // 2) TESTIMONIAL SLIDER — optimized + CPU safe
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

    // Stop slider when tab inactive — CPU saving
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopSlider() : startSlider();
    });

    startSlider();
  }

  // =====================================================
  // 3) GALLERY LIGHTBOX — upgraded
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

    // Close on outside click
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  // =====================================================
  // 4) UNIFIED FAQ ACCORDION (smooth + safe)
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
  // 5) Lazy-load GSAP only if animations enabled
  // =====================================================
  if (prefersReducedMotion) return;

  function loadGSAP() {
    return new Promise((resolve) => {
      if (window.gsap) return resolve(window.gsap);

      const core = document.createElement("script");
      core.src =
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";

      const trig = document.createElement("script");
      trig.src =
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";

      core.onload = () => {
        trig.onload = () => resolve(window.gsap);
        document.head.appendChild(trig);
      };

      document.head.appendChild(core);
    });
  }

  // =====================================================
  // 6) GSAP ANIMATIONS — smoother + optimized
  // =====================================================
  loadGSAP().then((gsap) => {
    gsap.registerPlugin(window.ScrollTrigger);

    // Header fade-in
    const header = $(".header");
    if (header)
      gsap.from(header, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power2.out",
      });

    // Hero
    const heroLeft = $(".hero-left");
    const heroImg = $(".hero-right img");

    if (heroLeft)
      gsap.from(heroLeft.children, {
        opacity: 0,
        y: 25,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
      });

    if (heroImg)
      gsap.from(heroImg, {
        opacity: 0,
        scale: 0.95,
        duration: 0.75,
        ease: "power3.out",
      });

    // Reveal sections
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

    // Hover pop for treatment cards
    $$(".treatment-card").forEach((card) => {
      card.addEventListener("mouseenter", () =>
        gsap.to(card, { scale: 1.04, duration: 0.2 })
      );
      card.addEventListener("mouseleave", () =>
        gsap.to(card, { scale: 1.0, duration: 0.2 })
      );
    });

    // Floating WhatsApp animation
    const wa = $(".whatsapp-btn");
    if (wa) {
      gsap.to(wa, {
        y: -6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // Footer animation
    const footer = $("footer");
    if (footer)
      gsap.from(footer, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        scrollTrigger: {
          trigger: footer,
          start: "top 95%",
        },
      });
  });

})();
