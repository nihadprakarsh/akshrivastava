/**
 * Ultra-Modern Legal Website - Advanced JavaScript
 * Advocate Akhilesh Shrivastava
 *
 * Features:
 * - Advanced loading animations
 * - Glassmorphism effects
 * - Micro-interactions
 * - Performance optimizations
 * - Modern ES6+ architecture
 * - Advanced scroll effects
 * - Premium animations
 * - Swiper.js integration for carousels
 * - Web3Forms integration for email submission
 */

(function() {
    'use strict';

    // Advanced Configuration
    const AppConfig = {
        debounceDelay: 100,
        carouselInterval: 5000, // Adjusted for better user experience
        counterAnimationDuration: 2500,
        loadingDuration: 1500, // Faster loading hide
        web3FormsAccessKey: "f172d582-f61e-4dc1-ac3a-c144e252b0dd", // <-- IMPORTANT: REPLACE THIS KEY
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        },
        easing: {
            smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
    };

    // Utility Functions
    const Utils = {
        $(selector, context = document) { return context.querySelector(selector); },
        $$(selector, context = document) { return [...context.querySelectorAll(selector)]; },
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        animateNumber(element, target, duration = 2000, easing = 'easeOutCubic') {
            const start = parseInt(element.textContent) || 0;
            const change = target - start;
            if(change === 0) return;
            const startTime = performance.now();
            const easingFunctions = {
                easeOutCubic: t => 1 - Math.pow(1 - t, 3)
            };
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = easingFunctions[easing] ? easingFunctions[easing](progress) : progress;
                element.textContent = Math.floor(start + change * easeProgress);
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        },
        createIntersectionObserver(callback, options = {}) {
            const defaultOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
            return new IntersectionObserver(callback, { ...defaultOptions, ...options });
        },
        getCurrentTheme() {
            return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        },
        setTheme(theme) {
            document.documentElement.setAttribute('data-color-scheme', theme);
            localStorage.setItem('theme', theme);
        }
    };

    // Loading Screen Module
    const LoadingScreen = {
        init() {
            const element = Utils.$('#loading-screen');
            if (element) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        element.classList.add('hidden');
                        setTimeout(() => element.remove(), 500);
                    }, AppConfig.loadingDuration);
                });
            }
        }
    };

    // Navigation Module
    const Navigation = {
        init() {
            const header = Utils.$('#header');
            const navToggle = Utils.$('#nav-toggle');
            const navMenu = Utils.$('#nav-menu');
            const navClose = Utils.$('#nav-close');
            const navLinks = Utils.$$('.nav__link');

            if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
            if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    navMenu.classList.remove('show-menu');
                    const targetId = link.getAttribute('href');
                    if (targetId.startsWith('#')) {
                        e.preventDefault();
                        const targetElement = Utils.$(targetId);
                        if (targetElement) {
                            const headerHeight = header.offsetHeight;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        }
                    }
                });
            });

            const scrollHandler = Utils.throttle(() => {
                header.classList.toggle('scrolled', window.scrollY > 50);
                this.updateActiveLink(navLinks, header.offsetHeight);
            }, 100);

            window.addEventListener('scroll', scrollHandler);
        },
        updateActiveLink(navLinks, headerHeight) {
            let currentSectionId = '';
            Utils.$$('section[id]').forEach(section => {
                if (section.getBoundingClientRect().top < headerHeight + 50) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                link.classList.toggle('active-link', linkHref === `#${currentSectionId}`);
            });
        }
    };

    // Theme Toggle Module
    const ThemeToggle = {
        init() {
            const toggle = Utils.$('#theme-toggle');
            if (!toggle) return;
            const icon = Utils.$('.theme-toggle__icon');
            const applyTheme = (theme) => {
                Utils.setTheme(theme);
                if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            };
            toggle.addEventListener('click', () => applyTheme(Utils.getCurrentTheme() === 'dark' ? 'light' : 'dark'));
            applyTheme(Utils.getCurrentTheme());
        }
    };

    // Stats Counter Module
    const StatsCounter = {
        init() {
            const heroStats = Utils.$('.hero__stats');
            if (!heroStats) return;
            const observer = Utils.createIntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    Utils.$$('.stat-card__number[data-target]').forEach((counter, index) => {
                        const target = +counter.dataset.target;
                        setTimeout(() => Utils.animateNumber(counter, target, AppConfig.counterAnimationDuration), index * 150);
                    });
                    observer.disconnect();
                }
            }, { threshold: 0.8 });
            observer.observe(heroStats);
        }
    };

    // Testimonials Carousel Module - FIX
    const TestimonialsCarousel = {
        init() {
            const slides = Utils.$$('.testimonial-card');
            const navButtons = Utils.$$('.testimonial-nav-btn');
            if (slides.length <= 1) return;

            let currentSlide = 0;
            let autoplayTimer = null;

            const showSlide = (index) => {
                if (index < 0 || index >= slides.length) return;
                slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
                navButtons.forEach((btn, i) => btn.classList.toggle('active', i === index));
                currentSlide = index;
            };

            const nextSlide = () => showSlide((currentSlide + 1) % slides.length);

            const startAutoplay = () => {
                clearInterval(autoplayTimer);
                autoplayTimer = setInterval(nextSlide, AppConfig.carouselInterval);
            };

            navButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    showSlide(index);
                    startAutoplay(); // Reset timer on manual navigation
                });
            });
            
            Utils.$('#testimonials-carousel').addEventListener('mouseenter', () => clearInterval(autoplayTimer));
            Utils.$('#testimonials-carousel').addEventListener('mouseleave', startAutoplay);

            showSlide(0);
            startAutoplay();
        }
    };

    // Swiper Carousels Module
    const SwiperCarousels = {
        init() {
            if (typeof Swiper === 'undefined') {
                console.error("Swiper library is not loaded.");
                return;
            }
            new Swiper('.team-carousel', {
                loop: true,
                grabCursor: true,
                spaceBetween: 20,
                pagination: { el: '.team-carousel .swiper-pagination', clickable: true },
                breakpoints: {
                    320: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 30 },
                    1024: { slidesPerView: 3, spaceBetween: 30 }
                }
            });
            new Swiper('.clients-carousel', {
                loop: true,
                grabCursor: true,
                spaceBetween: 20,
                autoplay: { delay: 3000, disableOnInteraction: false },
                pagination: { el: '.clients-carousel .swiper-pagination', clickable: true },
                breakpoints: {
                    320: { slidesPerView: 1, spaceBetween: 20 },
                    480: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: 3, spaceBetween: 30 },
                    1024: { slidesPerView: 4, spaceBetween: 30 }
                }
            });
        }
    };
    
    // Form Handling Module (For both forms)
    const FormHandler = {
        init() {
            const consultationForm = Utils.$('#consultation-form');
            const contactForm = Utils.$('#contact-form');
            if (consultationForm) this.attachListener(consultationForm);
            if (contactForm) this.attachListener(contactForm);
        },
        attachListener(formElement) {
            formElement.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (AppConfig.web3FormsAccessKey === "YOUR_ACCESS_KEY_HERE") {
                    alert("Please replace 'YOUR_ACCESS_KEY_HERE' in app.js with your Web3Forms access key.");
                    return;
                }

                const formData = new FormData(formElement);
                formData.append("access_key", AppConfig.web3FormsAccessKey);
                const object = Object.fromEntries(formData);
                const json = JSON.stringify(object);
                
                const submitButton = formElement.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.disabled = true;
                submitButton.innerHTML = '<span>Sending...</span>';

                try {
                    const response = await fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: json
                    });
                    const result = await response.json();
                    if (result.success) {
                        submitButton.innerHTML = '<span>Sent Successfully!</span>';
                        formElement.reset();
                    } else {
                        console.error("Form submission error:", result);
                        submitButton.innerHTML = `<span>Error! Try Again.</span>`;
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                    submitButton.innerHTML = `<span>Error! Try Again.</span>`;
                } finally {
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                    }, 4000);
                }
            });
        }
    };

    // Modal Module
    const Modal = {
        init() {
            const modal = Utils.$('#consultation-modal');
            const openButtons = Utils.$$('.consultation-btn');
            const closeButton = Utils.$('#modal-close');
            if (!modal) return;
            const openModal = () => modal.classList.remove('hidden');
            const closeModal = () => modal.classList.add('hidden');
            openButtons.forEach(btn => btn.addEventListener('click', openModal));
            if (closeButton) closeButton.addEventListener('click', closeModal);
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', e => {
                if (e.key === "Escape" && !modal.classList.contains('hidden')) closeModal();
            });
        }
    };
    
    // Scroll Animations Module
    const ScrollAnimations = {
        init() {
            const elements = Utils.$$('.premium-card, .timeline-item, .highlight-item');
            if (elements.length === 0) return;
            const observer = Utils.createIntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = `fadeInUp 0.8s ease-out both`;
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            elements.forEach(el => observer.observe(el));
        }
    };

    // Main App Controller
    const App = {
        modules: [
            LoadingScreen,
            Navigation,
            ThemeToggle,
            StatsCounter,
            TestimonialsCarousel,
            SwiperCarousels,
            Modal,
            FormHandler,
            ScrollAnimations
        ],
        init() {
            document.addEventListener('DOMContentLoaded', () => {
                this.modules.forEach(module => {
                    try {
                        if (typeof module.init === 'function') module.init();
                    } catch(e) {
                        console.error(`Error initializing module`, module, e);
                    }
                });
                console.log('✅ Website Initialized Successfully!');
            });
        }
    };

    App.init();

})();