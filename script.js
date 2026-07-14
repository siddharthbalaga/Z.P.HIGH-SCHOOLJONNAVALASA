/* ============================================================
   script.js — Z.P. High School, Jonnavalasa
   Vanilla JavaScript · No frameworks
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. UTILITY HELPERS
     ---------------------------------------------------------- */

  /** Debounce — delays execution until idle for `wait` ms */
  function debounce(fn, wait = 150) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** Throttle via requestAnimationFrame — one call per frame */
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        ticking = false;
      });
    };
  }

  /* ----------------------------------------------------------
     1. LOADING SCREEN
     ---------------------------------------------------------- */

  function initLoader() {
    const loader = document.getElementById('loader-screen');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');          // trigger CSS fade-out
        setTimeout(() => {
          loader.style.display = 'none';         // remove from flow
        }, 500);                                  // match transition duration
      }, 800);
    });
  }

  /* ----------------------------------------------------------
     2. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */

  function updateScrollProgress() {
    const bar = document.getElementById('scroll-progress-bar');
    if (!bar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }

  /* ----------------------------------------------------------
     3. HEADER SCROLL EFFECT
     ---------------------------------------------------------- */

  function updateHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;

    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ----------------------------------------------------------
     4. MOBILE MENU TOGGLE
     ---------------------------------------------------------- */

  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    function openMenu() {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Toggle on hamburger click
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Close when a nav link is clicked
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ----------------------------------------------------------
     5. SMOOTH SCROLL
     ---------------------------------------------------------- */

  function initSmoothScroll() {
    const HEADER_OFFSET = 80; // px

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (id === '#' || id === '') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     7. ACTIVE NAV HIGHLIGHTING
     ---------------------------------------------------------- */

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#main-nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const scrollY = window.scrollY + 120; // offset for header + some padding

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ----------------------------------------------------------
     8. ANIMATED NUMBER COUNTERS
     ---------------------------------------------------------- */

  function initCounters() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    let animated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            counters.forEach(animateCounter);
            observer.disconnect(); // only once
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe a parent section that contains the counters (first counter's section)
    const section = counters[0].closest('section') || counters[0].parentElement;
    if (section) observer.observe(section);

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000; // ms
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }
  }

  /* ----------------------------------------------------------
     9. SCROLL ANIMATIONS (IntersectionObserver)
     ---------------------------------------------------------- */

  function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const staggerParents = document.querySelectorAll('.stagger-children');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));

    // Stagger children — add `visible` to parent when it enters
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    staggerParents.forEach((parent) => staggerObserver.observe(parent));
  }

  /* ----------------------------------------------------------
     10. RESULTS EXPLORER (Year Tabs)
     ---------------------------------------------------------- */

  function initResultsExplorer() {
    const resultData = {
      2022: {
        rate: 66,
        note: 'The year that sets the starting point for the current Class 10 result story.',
      },
      2023: {
        rate: 89,
        note: 'A major academic jump driven by stronger preparation and learner support.',
      },
      2024: {
        rate: 92,
        note: 'A steady improvement year that crossed the 90% mark.',
      },
      2025: {
        rate: 97,
        note: 'Latest result in the four-year trend and the highest currently shown.',
      },
    };

    const tabs = document.querySelectorAll('.year-tab');
    const bars = document.querySelectorAll('.result-bar');
    const rateEl = document.getElementById('pass-rate');
    const ringEl = document.getElementById('pass-ring');
    const noteEl = document.getElementById('result-note');

    if (!tabs.length || !rateEl) return;

    function selectYear(year) {
      const data = resultData[year];
      if (!data) return;

      tabs.forEach((tab) => {
        const isActive = tab.getAttribute('data-year') === String(year);
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      bars.forEach((bar) => {
        bar.classList.toggle('active', bar.getAttribute('data-year') === String(year));
      });

      rateEl.textContent = data.rate + '%';
      if (ringEl) ringEl.style.setProperty('--progress', data.rate);
      if (noteEl) noteEl.textContent = data.note;
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => selectYear(tab.getAttribute('data-year')));
    });

    bars.forEach((bar) => {
      bar.addEventListener('click', () => selectYear(bar.getAttribute('data-year')));
    });
  }

  /* ----------------------------------------------------------
     11. TIMELINE MILESTONES
     ---------------------------------------------------------- */

  function initTimeline() {
    const dots = document.querySelectorAll('.milestone-dot');
    const kickerEl = document.getElementById('timeline-kicker');
    const textEl = document.getElementById('timeline-text');

    if (!dots.length) return;

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        // Remove active from all milestones
        document.querySelectorAll('.milestone').forEach((m) => m.classList.remove('active'));

        // Activate parent milestone
        const parent = dot.closest('.milestone');
        if (parent) parent.classList.add('active');

        // Update content from the selected milestone.
        if (parent && kickerEl) kickerEl.textContent = parent.getAttribute('data-kicker') || '';
        if (parent && textEl) textEl.textContent = parent.getAttribute('data-text') || '';
      });
    });
  }

  /* ----------------------------------------------------------
     12. GALLERY FILTERING
     ---------------------------------------------------------- */

  function initGalleryFilter() {
    const tabs = document.querySelectorAll('.gallery-tab');
    const grid = document.getElementById('gallery-grid');
    if (!tabs.length || !grid) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');
        const figures = grid.querySelectorAll('figure');

        figures.forEach((fig) => {
          const category = fig.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            fig.style.display = '';
            // Trigger reflow for fade-in animation
            fig.classList.remove('fade-in');
            void fig.offsetWidth; // force reflow
            fig.classList.add('fade-in');
          } else {
            fig.style.display = 'none';
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     13. LIGHTBOX
     ---------------------------------------------------------- */

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbTitle = document.getElementById('lightbox-title');
    const lbCaption = document.getElementById('lightbox-caption');
    const lbCounter = document.getElementById('lightbox-counter');
    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    if (!lightbox || !lbImg) return;

    let images = [];
    let currentIndex = 0;

    function isVisible(el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    /** Collect visible page images, skipping logos and the lightbox image itself */
    function collectImages() {
      images = Array.from(document.querySelectorAll('img'))
        .filter((img) => {
          if (img === lbImg) return false;
          if (img.classList.contains('no-lightbox')) return false;
          if (img.closest('.lightbox')) return false;
          return isVisible(img);
        })
        .map((img) => {
          const figure = img.closest('figure');
          const caption = figure ? figure.querySelector('figcaption') : null;
          const cardTitle = img.closest('.innov-card, .activity-card, .infra-card, .hm-profile, .pmshri-logo-card')?.querySelector('h3');

          return {
            src: img.currentSrc || img.src,
            title: caption ? (caption.querySelector('span')?.textContent || img.alt || 'Photo') : (cardTitle?.textContent || img.alt || 'Photo'),
            caption: caption ? (caption.querySelector('b')?.textContent || '') : img.alt,
          };
        });
    }

    function imageIndexFor(targetImg) {
      const src = targetImg.currentSrc || targetImg.src;
      return images.findIndex((item) => item.src === src);
    }

    document.querySelectorAll('img:not(.no-lightbox)').forEach((img) => {
      if (img.closest('.lightbox')) return;
      img.classList.add('lightbox-trigger');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Open image: ' + (img.alt || 'photo'));
    });

    /** Show a specific image by index */
    function showImage(index) {
      if (!images.length) return;
      currentIndex = ((index % images.length) + images.length) % images.length; // wrap around
      const data = images[currentIndex];
      lbImg.src = data.src;
      if (lbTitle) lbTitle.textContent = data.title;
      if (lbCaption) lbCaption.textContent = data.caption;
      if (lbCounter) lbCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
    }

    /** Open lightbox */
    function openLightbox(index) {
      collectImages();
      showImage(index);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    /** Close lightbox */
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Click any page image
    document.addEventListener('click', (e) => {
      const img = e.target.closest('img.lightbox-trigger');
      if (!img || img.closest('.lightbox')) return;
      collectImages();
      const idx = imageIndexFor(img);
      openLightbox(idx >= 0 ? idx : 0);
    });

    document.addEventListener('keydown', (e) => {
      const img = e.target.closest?.('img.lightbox-trigger');
      if (!img || img.closest('.lightbox')) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();
      collectImages();
      const idx = imageIndexFor(img);
      openLightbox(idx >= 0 ? idx : 0);
    });

    // Navigation buttons
    if (btnPrev) btnPrev.addEventListener('click', () => showImage(currentIndex - 1));
    if (btnNext) btnNext.addEventListener('click', () => showImage(currentIndex + 1));

    // Close button
    if (btnClose) btnClose.addEventListener('click', closeLightbox);

    // Close on dark area click (not image)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || !lbImg.contains(e.target) &&
          !btnPrev?.contains(e.target) && !btnNext?.contains(e.target) &&
          !btnClose?.contains(e.target)) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ----------------------------------------------------------
     14. TESTIMONIAL SLIDER
     ---------------------------------------------------------- */

  function initTestimonialSlider() {
    const wrapper = document.getElementById('testimonial-wrapper');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (!wrapper) return;

    const slides = wrapper.children;
    const total = slides.length;
    let current = 0;
    let autoplayTimer = null;
    const INTERVAL = 5000; // 5 seconds

    /** Go to a specific slide */
    function goToSlide(index) {
      current = ((index % total) + total) % total;
      wrapper.style.transform = 'translateX(-' + (current * 100) + '%)';

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    /** Start auto-advance */
    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => goToSlide(current + 1), INTERVAL);
    }

    /** Stop auto-advance */
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    // Dot click
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goToSlide(i);
        startAutoplay(); // restart timer
      });
    });

    // Pause on hover
    const sliderContainer = wrapper.closest('.testimonial-slider') || wrapper.parentElement;
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopAutoplay);
      sliderContainer.addEventListener('mouseleave', startAutoplay);
    }

    // Init
    goToSlide(0);
    startAutoplay();
  }

  /* ----------------------------------------------------------
     15. CONTACT FORM
     ---------------------------------------------------------- */

  function initContactForm() {
    const form = document.getElementById('contact-form');
    const success = document.getElementById('form-success');
    const resetBtn = document.getElementById('form-reset-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      if (success) success.style.display = '';
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (success) success.style.display = 'none';
        form.style.display = '';
        form.reset();
      });
    }
  }

  /* ----------------------------------------------------------
     16. BACK TO TOP
     ---------------------------------------------------------- */

  function updateBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     17. COMBINED SCROLL HANDLER (Performance)
     ---------------------------------------------------------- */

  const onScroll = rafThrottle(() => {
    updateScrollProgress();
    updateHeaderScroll();
    updateActiveNav();
    updateBackToTop();
  });

  /* ----------------------------------------------------------
     NEWS FILTER
     ---------------------------------------------------------- */

  function initNewsFilter() {
    const tabs = document.querySelectorAll('[data-news-filter]');
    const cards = document.querySelectorAll('.news-card');
    if (!tabs.length || !cards.length) return;

    // Wire up onerror for each news image → show newspaper placeholder
    document.querySelectorAll('.news-card-img-wrap img').forEach(img => {
      const wrap = img.closest('.news-card-img-wrap');
      const badge = wrap ? wrap.querySelector('.news-source-badge') : null;
      if (wrap && badge) {
        // Copy source name into data-source for CSS content
        wrap.dataset.source = badge.textContent.trim();
      }
      img.addEventListener('error', () => {
        const w = img.closest('.news-card-img-wrap');
        if (w) {
          w.classList.add('img-missing');
          img.style.display = 'none';
        }
      });
      // Trigger immediately if already broken (cached 404)
      if (img.complete && !img.naturalWidth) {
        img.dispatchEvent(new Event('error'));
      }
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.newsFilter;

        cards.forEach(card => {
          const cat = card.dataset.newsCategory;
          if (filter === 'all' || cat === filter) {
            card.classList.remove('news-hidden');
          } else {
            card.classList.add('news-hidden');
          }
        });
      });
    });
  }

  /* Place the official academic outcome ahead of image-led school stories. */
  function prioritizeResults() {
    const results = document.getElementById('results');
    const innovations = document.getElementById('innovations');
    if (results && innovations) innovations.before(results);
  }

  /* ----------------------------------------------------------
     INIT — Boot everything on DOMContentLoaded
     ---------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    prioritizeResults();
    initLoader();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    initScrollAnimations();
    initResultsExplorer();
    initTimeline();
    initGalleryFilter();
    initLightbox();
    initNewsFilter();
    initBackToTop();

    // Attach optimised scroll listener (passive for performance)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Debounced resize — recalculate anything layout-dependent
    window.addEventListener(
      'resize',
      debounce(() => {
        // Placeholder for any resize-dependent recalculations
        updateScrollProgress();
        updateActiveNav();
      }, 200),
      { passive: true }
    );
  });
})();
