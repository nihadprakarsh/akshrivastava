(function () {
  'use strict';

  /* ================= CONFIG ================= */
  const AppConfig = window.__APP_CONFIG__ || {
    carouselInterval: 5000,
    counterAnimationDuration: 2500,
    loadingDuration: 1500,
    web3FormsAccessKey: "f172d582-f61e-4dc1-ac3a-c144e252b0dd"
  };

  /* ================= UTILS ================= */
  const Utils = {
    $(s, c = document) { return c.querySelector(s); },
    $$(s, c = document) { return [...c.querySelectorAll(s)]; },

    animateNumber(el, target, duration = 2000) {
      const start = parseInt(el.textContent) || 0;
      const change = target - start;
      const suffix = el.dataset.suffix || '';
      const startTime = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(start + change * eased) + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },

    createObserver(cb, options = {}) {
      return new IntersectionObserver(cb, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      });
    },

    getTheme() {
      return localStorage.getItem('theme') ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-color-scheme', theme);
      localStorage.setItem('theme', theme);
    }
  };

  /* ================= LOADING ================= */
  const LoadingScreen = {
    init() {
      const el = Utils.$('#loading-screen');
      if (!el) return;

      setTimeout(() => {
        el.classList.add('hidden');
        setTimeout(() => el.remove(), 500);
      }, AppConfig.loadingDuration);

      setTimeout(() => {
        if (document.body.contains(el)) el.remove();
      }, 5000);
    }
  };

  /* ================= NAVIGATION ================= */
  const Navigation = {
    init() {
      const header = Utils.$('#header');
      const navMenu = Utils.$('#nav-menu');
      const navToggle = Utils.$('#nav-toggle');
      const navClose = Utils.$('#nav-close');
      const navLinks = Utils.$$('.nav__link');
      if (!header || !navMenu) return;

      navToggle?.addEventListener('click', () => navMenu.classList.add('show-menu'));
      navClose?.addEventListener('click', () => navMenu.classList.remove('show-menu'));

      navLinks.forEach(link => {
        link.addEventListener('click', e => {
          const id = link.getAttribute('href');
          navMenu.classList.remove('show-menu');
          if (!id.startsWith('#')) return;

          e.preventDefault();
          const target = Utils.$(id);
          if (!target) return;

          window.scrollTo({
            top: target.offsetTop - header.offsetHeight,
            behavior: 'smooth'
          });
        });
      });

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            header.classList.toggle('scrolled', scrollY > 50);
            this.updateActive(navLinks, header.offsetHeight);
            ticking = false;
          });
          ticking = true;
        }
      });
    },

    updateActive(links, offset) {
      let current = '';
      Utils.$$('section[id]').forEach(sec => {
        if (sec.getBoundingClientRect().top < offset + 60) {
          current = sec.id;
        }
      });
      links.forEach(l =>
        l.classList.toggle('active-link', l.getAttribute('href') === `#${current}`)
      );
    }
  };

  /* ================= THEME ================= */
  const ThemeToggle = {
    init() {
      const btn = Utils.$('#theme-toggle');
      const icon = Utils.$('.theme-toggle__icon');
      if (!btn) return;

      const apply = t => {
        Utils.setTheme(t);
        if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
      };

      btn.addEventListener('click', () =>
        apply(Utils.getTheme() === 'dark' ? 'light' : 'dark')
      );
      apply(Utils.getTheme());
    }
  };

  /* ================= STATS ================= */
  const StatsCounter = {
    init() {
      const section = Utils.$('.hero__stats');
      if (!section) return;

      const observer = Utils.createObserver(entries => {
        if (entries[0].isIntersecting) {
          Utils.$$('.stat-card__number[data-target]').forEach((el, i) => {
            setTimeout(() =>
              Utils.animateNumber(el, +el.dataset.target, AppConfig.counterAnimationDuration),
              i * 150
            );
          });
          observer.disconnect();
        }
      }, { threshold: 0.8 });

      observer.observe(section);
    }
  };

  /* ================= SWIPER (FIXED CLIENTS) ================= */
  const SwiperCarousels = {
    init() {
      if (typeof Swiper === 'undefined') {
        console.error('Swiper not loaded');
        return;
      }

      /* TEAM */
      if (!document.querySelector('.team-carousel.swiper-initialized')) {
        new Swiper('.team-carousel', {
          loop: true,
          grabCursor: true,
          spaceBetween: 30,
          navigation: {
            nextEl: '.team-carousel-button-next',
            prevEl: '.team-carousel-button-prev'
          },
          pagination: {
            el: '.team-carousel .swiper-pagination',
            clickable: true
          },
          breakpoints: {
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }
        });
      }

      /* CLIENTS — FIXED */
      if (!document.querySelector('.clients-carousel.swiper-initialized')) {
        new Swiper('.clients-carousel', {
          loop: true,
          grabCursor: true,
          spaceBetween: 30,
          autoplay: {
            delay: 3000,
            disableOnInteraction: false
          },
          pagination: {
            el: '.clients-carousel .swiper-pagination',
            clickable: true
          },
          breakpoints: {
            320: { slidesPerView: 1 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 }
          }
        });
      }
    }
  };

  /* ================= FORMS ================= */
  const FormHandler = {
    init() {
      Utils.$$('#consultation-form, #contact-form').forEach(f => this.attach(f));
    },

    attach(form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();

        if (!AppConfig.web3FormsAccessKey) {
          alert('Web3Forms key missing');
          return;
        }

        if (![...form.elements].every(el => !el.required || el.value.trim())) {
          alert('Please fill all required fields');
          return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
          const body = JSON.stringify({
            ...Object.fromEntries(new FormData(form)),
            access_key: AppConfig.web3FormsAccessKey
          });

          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
          });

          const data = await res.json();
          if (!data.success) throw new Error();

          btn.textContent = 'Sent Successfully!';
          form.reset();
          return;
        } catch {
          btn.textContent = 'Error! Try Again';
        } finally {
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = 'Submit';
          }, 4000);
        }
      });
    }
  };

  /* ================= MODAL ================= */
  const Modal = {
    init() {
      const modal = Utils.$('#consultation-modal');
      if (!modal) return;

      const open = () => {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };

      const close = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };

      Utils.$$('.consultation-btn').forEach(b => b.addEventListener('click', open));
      Utils.$('#modal-close')?.addEventListener('click', close);

      modal.addEventListener('click', e => e.target === modal && close());
      document.addEventListener('keydown', e => e.key === 'Escape' && close());
    }
  };

  /* ================= CARD FLIP ================= */
  const CardFlipper = {
    init() {
      document.addEventListener('click', e => {
        const btn = e.target.closest('.js-flip-button');
        btn?.closest('.team-card')?.classList.toggle('is-flipped');
      });
    }
  };

  /* ================= SCROLL ANIM ================= */
  const ScrollAnimations = {
    init() {
      const els = Utils.$$('.premium-card, .timeline-item, .highlight-item');
      if (!els.length) return;

      const observer = Utils.createObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.animation = 'fadeInUp 0.8s ease-out both';
            observer.unobserve(e.target);
          }
        });
      });

      els.forEach(el => observer.observe(el));
    }
  };

  /* ================= APP ================= */
  const App = {
    modules: [
      LoadingScreen,
      Navigation,
      ThemeToggle,
      StatsCounter,
      SwiperCarousels,
      Modal,
      FormHandler,
      CardFlipper,
      ScrollAnimations
    ],
    init() {
      this.modules.forEach(m => m.init?.());
      console.log('✅ Website Initialized Successfully');
    }
  };

  document.addEventListener('DOMContentLoaded', () => App.init());

})();