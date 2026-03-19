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
        $(s, c = document) {
            return c.querySelector(s);
        },
        $$(s, c = document) {
            return [...c.querySelectorAll(s)];
        },

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
            return localStorage.getItem('theme') || 'light';
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

                    if (!id || !id.startsWith('#')) return;

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
                        header.classList.toggle('scrolled', window.scrollY > 50);
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

    /* ================= SWIPER ================= */
    const SwiperCarousels = {
        init() {
            if (typeof Swiper === 'undefined') return;

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

            if (!document.querySelector('.about-carousel.swiper-initialized')) {
                new Swiper('.about-carousel', {
                    loop: false,
                    grabCursor: true,
                    spaceBetween: 60,
                    autoHeight: true,
                    pagination: {
                        el: '.about-carousel .swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.about-carousel .swiper-button-next',
                        prevEl: '.about-carousel .swiper-button-prev'
                    }
                });
            }

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

    /* ================= NOTABLE CASES ================= */
    const NotableCases = {
        init() {
            this.root = Utils.$('.notable-cases');
            this.grid = Utils.$('.cases-grid', this.root);
            this.overview = Utils.$('#caseOverview', this.root);
            this.filters = Utils.$$('.case-filter', this.root);
            this.searchInput = Utils.$('#caseSearch', this.root);
            this.cards = Utils.$$('.case-card', this.grid);

            if (!this.root || !this.grid || !this.cards.length) return;

            this.categories = [
                {
                    key: 'supreme',
                    label: 'Supreme Court',
                    icon: 'SC',
                    description: 'Constitutional, civil, criminal, and insolvency appellate matters.'
                },
                {
                    key: 'highcourt',
                    label: 'High Courts',
                    icon: 'HC',
                    description: 'A broad portfolio across company, writ, service, labour, and criminal litigation.'
                },
                {
                    key: 'nclat',
                    label: 'Tribunals',
                    icon: 'TR',
                    description: 'Appellate tribunal work including corporate and insolvency proceedings.'
                },
                {
                    key: 'probono',
                    label: 'Pro Bono',
                    icon: 'PB',
                    description: 'Rights-focused matters and public-interest representation.'
                }
            ];

            this.activeFilter = 'all';
            this.query = '';

            this.groupCards();
            this.renderOverview();
            this.bindEvents();
            this.syncActiveControls();
            this.applyState();
        },

        groupCards() {
            const fragment = document.createDocumentFragment();
            this.groups = [];

            this.categories.forEach(category => {
                const cards = this.cards.filter(card => card.dataset.category === category.key);
                if (!cards.length) return;

                const details = document.createElement('details');
                details.className = 'case-cluster';
                details.dataset.category = category.key;
                details.open = category.key === 'supreme';

                const summary = document.createElement('summary');
                summary.className = 'case-cluster__summary';

                const badge = document.createElement('span');
                badge.className = 'case-cluster__badge';
                badge.textContent = category.icon;

                const heading = document.createElement('div');
                heading.className = 'case-cluster__heading';

                const titleRow = document.createElement('div');
                titleRow.className = 'case-cluster__title-row';

                const title = document.createElement('h3');
                title.className = 'case-cluster__title';
                title.textContent = category.label;

                const count = document.createElement('span');
                count.className = 'case-cluster__count';
                count.dataset.visibleCount = category.key;

                const description = document.createElement('p');
                description.className = 'case-cluster__description';
                description.textContent = category.description;

                titleRow.append(title, count);
                heading.append(titleRow, description);
                summary.append(badge, heading);

                const body = document.createElement('div');
                body.className = 'case-cluster__body';

                const grid = document.createElement('div');
                grid.className = 'case-cluster__grid';

                cards.forEach((card, index) => {
                    card.classList.toggle('is-featured', index === 0);
                    grid.appendChild(card);
                });

                body.appendChild(grid);
                details.append(summary, body);
                fragment.appendChild(details);
                this.groups.push(details);
            });

            this.grid.replaceChildren(fragment);
        },

        renderOverview() {
            if (!this.overview) return;

            const allCategories = [
                { key: 'all', label: 'All Matters', icon: 'ALL', description: 'Complete matter portfolio.' },
                ...this.categories
            ];

            this.overview.replaceChildren();
            this.overviewControls = [];

            allCategories.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'case-overview-card';
                button.dataset.filter = category.key;

                const icon = document.createElement('span');
                icon.className = 'case-overview-card__icon';
                icon.textContent = category.icon;

                const label = document.createElement('span');
                label.className = 'case-overview-card__label';
                label.textContent = category.label;

                const count = document.createElement('strong');
                count.className = 'case-overview-card__count';
                count.dataset.overviewCount = category.key;

                const description = document.createElement('span');
                description.className = 'case-overview-card__description';
                description.textContent = category.description;

                button.append(icon, label, count, description);
                this.overview.appendChild(button);
                this.overviewControls.push(button);
            });
        },

        bindEvents() {
            const controls = [...this.filters, ...(this.overviewControls || [])];

            controls.forEach(control => {
                control.addEventListener('click', () => {
                    this.activeFilter = control.dataset.filter;
                    this.syncActiveControls();
                    this.applyState();
                });
            });

            this.searchInput?.addEventListener('input', () => {
                this.query = this.searchInput.value.trim().toLowerCase();
                this.applyState();
            });
        },

        syncActiveControls() {
            [...this.filters, ...(this.overviewControls || [])].forEach(control => {
                control.classList.toggle('active', control.dataset.filter === this.activeFilter);
            });
        },

        getVisibleCount(categoryKey) {
            return this.cards.filter(card => {
                const matchesCategory = categoryKey === 'all' || card.dataset.category === categoryKey;
                return matchesCategory && !card.classList.contains('is-hidden');
            }).length;
        },

        getTotalCount(categoryKey) {
            return this.cards.filter(card =>
                categoryKey === 'all' || card.dataset.category === categoryKey
            ).length;
        },

        applyState() {
            this.cards.forEach(card => {
                const matchesCategory =
                    this.activeFilter === 'all' || card.dataset.category === this.activeFilter;
                const matchesQuery =
                    !this.query || card.textContent.toLowerCase().includes(this.query);

                card.classList.toggle('is-hidden', !(matchesCategory && matchesQuery));
            });

            this.groups.forEach(group => {
                const visibleCards = Utils.$$('.case-card:not(.is-hidden)', group);
                const count = Utils.$('[data-visible-count]', group);
                const totalCards = Utils.$$('.case-card', group).length;

                if (count) {
                    const visibleLabel = `${visibleCards.length} matter${visibleCards.length === 1 ? '' : 's'}`;
                    count.textContent = this.query ? `${visibleLabel} shown` : `${totalCards} matter${totalCards === 1 ? '' : 's'}`;
                }

                group.hidden = visibleCards.length === 0;
                group.open = this.query
                    ? visibleCards.length > 0
                    : this.activeFilter === 'all'
                        ? group.dataset.category === 'supreme'
                        : visibleCards.length > 0;
            });

            [...(this.overviewControls || [])].forEach(control => {
                const count = Utils.$(`[data-overview-count="${control.dataset.filter}"]`, control);
                if (!count) return;

                const countValue = this.query
                    ? this.getVisibleCount(control.dataset.filter)
                    : this.getTotalCount(control.dataset.filter);

                count.textContent = `${countValue}`;
            });
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

                const btn = form.querySelector('button[type="submit"]');
                const originalLabel = btn.textContent.trim();
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
                } catch {
                    btn.textContent = 'Error! Try Again';
                } finally {
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.textContent = originalLabel;
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
                document.body.style.overflow = 'hidden';
            };

            const close = () => {
                modal.classList.add('hidden');
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
            const els = Utils.$$('.premium-card, .timeline-item, .highlight-item, .case-card');
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

    /* ================= TESTIMONIALS ================= */
    const Testimonials = {
        init() {
            const cards = Utils.$$('.testimonial-card');
            const nav = Utils.$('.testimonials-nav');
            if (!cards.length || !nav) return;

            let current = 0;
            let interval;

            nav.innerHTML = '';
            cards.forEach((_, i) => {
                const btn = document.createElement('button');
                btn.className = 'testimonial-nav-btn' + (i === 0 ? ' active' : '');
                btn.addEventListener('click', () => goTo(i));
                nav.appendChild(btn);
            });

            const dots = Utils.$$('.testimonial-nav-btn', nav);

            function show(index) {
                cards.forEach((c, i) => c.classList.toggle('active', i === index));
                dots.forEach((d, i) => d.classList.toggle('active', i === index));
                current = index;
            }

            function next() {
                show((current + 1) % cards.length);
            }

            function goTo(i) {
                clearInterval(interval);
                show(i);
                start();
            }

            function start() {
                interval = setInterval(next, AppConfig.carouselInterval);
            }

            show(0);
            start();
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
            NotableCases,
            Modal,
            FormHandler,
            CardFlipper,
            ScrollAnimations,
            Testimonials
        ],
        init() {
            this.modules.forEach(m => m.init?.());
            console.log('✅ Website Initialized Successfully');
        }
    };

    document.addEventListener('DOMContentLoaded', () => App.init());

})();
