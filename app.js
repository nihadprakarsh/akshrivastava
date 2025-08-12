/**
 * Legal Website - Production Grade JavaScript
 * Advocate Akhilesh Shrivastava
 * 
 * Features:
 * - Memory leak prevention
 * - Performance optimizations
 * - Error handling with try-catch
 * - Modular architecture
 * - Mobile-first responsive design
 * - Accessibility support
 */

(function() {
    'use strict';

    // Application state and configuration
    const AppConfig = {
        debounceDelay: 100,
        animationDuration: 300,
        carouselInterval: 5000,
        counterAnimationDuration: 2000,
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        }
    };

    // Utility functions
    const Utils = {
        // Debounce function to optimize performance
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
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

        // Safe query selector with error handling
        $(selector, context = document) {
            try {
                return context.querySelector(selector);
            } catch (error) {
                console.error(`Error selecting element: ${selector}`, error);
                return null;
            }
        },

        // Safe query selector all
        $$(selector, context = document) {
            try {
                return context.querySelectorAll(selector);
            } catch (error) {
                console.error(`Error selecting elements: ${selector}`, error);
                return [];
            }
        },

        // Animate number counter
        animateCounter(element, target, duration = 2000) {
            const start = parseInt(element.textContent) || 0;
            const increment = (target - start) / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
        },

        // Get current theme
        getCurrentTheme() {
            return localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        },

        // Set theme
        setTheme(theme) {
            try {
                document.documentElement.setAttribute('data-color-scheme', theme);
                localStorage.setItem('theme', theme);
            } catch (error) {
                console.error('Error setting theme:', error);
            }
        }
    };

    // Navigation module
    const Navigation = {
        elements: {},
        isMenuOpen: false,
        
        init() {
            try {
                this.cacheElements();
                this.bindEvents();
                this.handleActiveLink();
            } catch (error) {
                console.error('Navigation initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                header: Utils.$('#header'),
                navToggle: Utils.$('#nav-toggle'),
                navMenu: Utils.$('#nav-menu'),
                navClose: Utils.$('#nav-close'),
                navLinks: Utils.$$('.nav__link')
            };
        },

        bindEvents() {
            // Mobile menu toggle
            if (this.elements.navToggle) {
                this.elements.navToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMenu();
                });
            }

            // Menu close button
            if (this.elements.navClose) {
                this.elements.navClose.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeMenu();
                });
            }

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isMenuOpen && 
                    !this.elements.navMenu.contains(e.target) && 
                    !this.elements.navToggle.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // Navigation links
            this.elements.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        this.scrollToSection(href);
                        this.closeMenu();
                    }
                });
            });

            // Header scroll effect
            window.addEventListener('scroll', Utils.throttle(() => {
                this.handleHeaderScroll();
            }, AppConfig.debounceDelay));

            // Update active link on scroll
            window.addEventListener('scroll', Utils.throttle(() => {
                this.updateActiveLink();
            }, AppConfig.debounceDelay));
        },

        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            this.elements.navMenu.classList.toggle('show-menu', this.isMenuOpen);
            this.elements.navToggle.classList.toggle('active', this.isMenuOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
        },

        closeMenu() {
            this.isMenuOpen = false;
            this.elements.navMenu.classList.remove('show-menu');
            this.elements.navToggle.classList.remove('active');
            document.body.style.overflow = '';
        },

        scrollToSection(target) {
            try {
                const element = Utils.$(target);
                if (element) {
                    const headerHeight = this.elements.header?.offsetHeight || 70;
                    const targetPosition = element.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.error('Error scrolling to section:', error);
            }
        },

        handleHeaderScroll() {
            if (this.elements.header) {
                const scrolled = window.scrollY > 50;
                this.elements.header.classList.toggle('scrolled', scrolled);
            }
        },

        handleActiveLink() {
            // Set initial active link based on hash
            const hash = window.location.hash || '#home';
            this.setActiveLink(hash);
        },

        updateActiveLink() {
            const sections = Utils.$$('section[id]');
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.setActiveLink(`#${sectionId}`);
                }
            });
        },

        setActiveLink(target) {
            this.elements.navLinks.forEach(link => {
                link.classList.remove('active-link');
                if (link.getAttribute('href') === target) {
                    link.classList.add('active-link');
                }
            });
        }
    };

    // Theme toggle module
    const ThemeToggle = {
        elements: {},
        
        init() {
            try {
                this.cacheElements();
                this.setInitialTheme();
                this.bindEvents();
            } catch (error) {
                console.error('Theme toggle initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                toggle: Utils.$('#theme-toggle'),
                icon: Utils.$('.theme-toggle__icon')
            };
        },

        setInitialTheme() {
            const currentTheme = Utils.getCurrentTheme();
            Utils.setTheme(currentTheme);
            this.updateIcon(currentTheme);
        },

        bindEvents() {
            if (this.elements.toggle) {
                this.elements.toggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    Utils.setTheme(newTheme);
                    this.updateIcon(newTheme);
                }
            });
        },

        toggleTheme() {
            try {
                const currentTheme = Utils.getCurrentTheme();
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                Utils.setTheme(newTheme);
                this.updateIcon(newTheme);
            } catch (error) {
                console.error('Error toggling theme:', error);
            }
        },

        updateIcon(theme) {
            if (this.elements.icon) {
                this.elements.icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }
    };

    // Statistics counter module
    const StatsCounter = {
        elements: {},
        hasAnimated: false,
        
        init() {
            try {
                this.cacheElements();
                this.setupObserver();
            } catch (error) {
                console.error('Stats counter initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                counters: Utils.$$('.stat-card__number[data-target]')
            };
        },

        setupObserver() {
            if (!window.IntersectionObserver || this.elements.counters.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateCounters();
                        this.hasAnimated = true;
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.5 });

            this.elements.counters.forEach(counter => {
                observer.observe(counter);
            });
        },

        animateCounters() {
            this.elements.counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                if (!isNaN(target)) {
                    Utils.animateCounter(counter, target, AppConfig.counterAnimationDuration);
                }
            });
        }
    };

    // Testimonials carousel module
    const TestimonialsCarousel = {
        elements: {},
        currentSlide: 0,
        totalSlides: 0,
        autoplayTimer: null,
        
        init() {
            try {
                this.cacheElements();
                this.setupCarousel();
                this.bindEvents();
                this.startAutoplay();
            } catch (error) {
                console.error('Testimonials carousel initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                carousel: Utils.$('#testimonials-carousel'),
                slides: Utils.$$('.testimonial-card'),
                navButtons: Utils.$$('.testimonial-nav-btn')
            };
        },

        setupCarousel() {
            this.totalSlides = this.elements.slides.length;
            if (this.totalSlides === 0) return;

            // Show first slide
            this.showSlide(0);
        },

        bindEvents() {
            this.elements.navButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    this.goToSlide(index);
                    this.restartAutoplay();
                });
            });

            // Pause autoplay on hover
            if (this.elements.carousel) {
                this.elements.carousel.addEventListener('mouseenter', () => {
                    this.stopAutoplay();
                });

                this.elements.carousel.addEventListener('mouseleave', () => {
                    this.startAutoplay();
                });
            }
        },

        showSlide(index) {
            // Hide all slides
            this.elements.slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show current slide
            if (this.elements.slides[index]) {
                this.elements.slides[index].classList.add('active');
            }

            // Update navigation
            this.elements.navButtons.forEach((button, i) => {
                button.classList.toggle('active', i === index);
            });

            this.currentSlide = index;
        },

        goToSlide(index) {
            if (index >= 0 && index < this.totalSlides) {
                this.showSlide(index);
            }
        },

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.totalSlides;
            this.showSlide(nextIndex);
        },

        startAutoplay() {
            this.stopAutoplay();
            if (this.totalSlides > 1) {
                this.autoplayTimer = setInterval(() => {
                    this.nextSlide();
                }, AppConfig.carouselInterval);
            }
        },

        stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        },

        restartAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }
    };

    // Modal module
    const Modal = {
        elements: {},
        
        init() {
            try {
                this.cacheElements();
                this.bindEvents();
            } catch (error) {
                console.error('Modal initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                modal: Utils.$('#consultation-modal'),
                openButtons: Utils.$$('.consultation-btn'),
                closeButton: Utils.$('#modal-close'),
                form: Utils.$('#consultation-form')
            };
        },

        bindEvents() {
            // Open modal buttons
            this.elements.openButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal();
                });
            });

            // Close modal button
            if (this.elements.closeButton) {
                this.elements.closeButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeModal();
                });
            }

            // Close modal on backdrop click
            if (this.elements.modal) {
                this.elements.modal.addEventListener('click', (e) => {
                    if (e.target === this.elements.modal) {
                        this.closeModal();
                    }
                });
            }

            // Close modal on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isModalOpen()) {
                    this.closeModal();
                }
            });

            // Handle form submission
            if (this.elements.form) {
                this.elements.form.addEventListener('submit', (e) => {
                    this.handleFormSubmission(e);
                });
            }
        },

        openModal() {
            if (this.elements.modal) {
                this.elements.modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                
                // Focus first input
                const firstInput = this.elements.modal.querySelector('input, select, textarea');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        },

        closeModal() {
            if (this.elements.modal) {
                this.elements.modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        },

        isModalOpen() {
            return this.elements.modal && !this.elements.modal.classList.contains('hidden');
        },

        handleFormSubmission(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this.elements.form);
                const data = Object.fromEntries(formData);
                
                // Basic validation
                if (!this.validateForm(data)) {
                    return;
                }

                // Simulate form submission
                this.simulateFormSubmission(data);
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showFormError('An error occurred. Please try again.');
            }
        },

        validateForm(data) {
            const required = ['name', 'email', 'phone', 'legal-area', 'message'];
            
            for (const field of required) {
                if (!data[field] || data[field].trim() === '') {
                    this.showFormError(`Please fill in the ${field.replace('-', ' ')} field.`);
                    return false;
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showFormError('Please enter a valid email address.');
                return false;
            }

            return true;
        },

        simulateFormSubmission(data) {
            // Show loading state
            const submitButton = this.elements.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
            }

            // Simulate API call
            setTimeout(() => {
                this.showFormSuccess('Thank you! Your consultation request has been submitted. We will contact you soon.');
                this.elements.form.reset();
                
                if (submitButton) {
                    submitButton.textContent = 'Schedule Consultation';
                    submitButton.disabled = false;
                }
                
                setTimeout(() => this.closeModal(), 2000);
            }, 1500);
        },

        showFormError(message) {
            this.showFormMessage(message, 'error');
        },

        showFormSuccess(message) {
            this.showFormMessage(message, 'success');
        },

        showFormMessage(message, type) {
            // Remove existing messages
            const existingMessage = this.elements.modal.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Create new message
            const messageElement = document.createElement('div');
            messageElement.className = `form-message form-message--${type}`;
            messageElement.style.cssText = `
                padding: var(--space-12);
                margin-bottom: var(--space-16);
                border-radius: var(--radius-base);
                font-size: var(--font-size-sm);
                text-align: center;
                background-color: ${type === 'error' ? 'rgba(var(--color-error-rgb), 0.1)' : 'rgba(var(--color-success-rgb), 0.1)'};
                color: ${type === 'error' ? 'var(--color-error)' : 'var(--color-success)'};
                border: 1px solid ${type === 'error' ? 'rgba(var(--color-error-rgb), 0.2)' : 'rgba(var(--color-success-rgb), 0.2)'};
            `;
            messageElement.textContent = message;

            // Insert at top of form
            this.elements.form.insertBefore(messageElement, this.elements.form.firstChild);
        }
    };

    // Contact form module
    const ContactForm = {
        elements: {},
        
        init() {
            try {
                this.cacheElements();
                this.bindEvents();
            } catch (error) {
                console.error('Contact form initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                form: Utils.$('#contact-form')
            };
        },

        bindEvents() {
            if (this.elements.form) {
                this.elements.form.addEventListener('submit', (e) => {
                    this.handleSubmission(e);
                });
            }
        },

        handleSubmission(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this.elements.form);
                const data = Object.fromEntries(formData);
                
                if (!this.validateForm(data)) {
                    return;
                }

                this.simulateSubmission(data);
                
            } catch (error) {
                console.error('Contact form submission error:', error);
                this.showMessage('An error occurred. Please try again.', 'error');
            }
        },

        validateForm(data) {
            const required = ['name', 'email', 'message'];
            
            for (const field of required) {
                if (!data[field] || data[field].trim() === '') {
                    this.showMessage(`Please fill in the ${field} field.`, 'error');
                    return false;
                }
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showMessage('Please enter a valid email address.', 'error');
                return false;
            }

            return true;
        },

        simulateSubmission(data) {
            const submitButton = this.elements.form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
            }

            setTimeout(() => {
                this.showMessage('Thank you! Your message has been sent. We will contact you soon.', 'success');
                this.elements.form.reset();
                
                if (submitButton) {
                    submitButton.textContent = 'Send Message';
                    submitButton.disabled = false;
                }
            }, 1500);
        },

        showMessage(message, type) {
            // Similar to Modal.showFormMessage but for contact form
            const existingMessage = this.elements.form.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            const messageElement = document.createElement('div');
            messageElement.className = `form-message form-message--${type}`;
            messageElement.style.cssText = `
                padding: var(--space-12);
                margin-bottom: var(--space-16);
                border-radius: var(--radius-base);
                font-size: var(--font-size-sm);
                text-align: center;
                background-color: ${type === 'error' ? 'rgba(var(--color-error-rgb), 0.1)' : 'rgba(var(--color-success-rgb), 0.1)'};
                color: ${type === 'error' ? 'var(--color-error)' : 'var(--color-success)'};
                border: 1px solid ${type === 'error' ? 'rgba(var(--color-error-rgb), 0.2)' : 'rgba(var(--color-success-rgb), 0.2)'};
            `;
            messageElement.textContent = message;

            this.elements.form.insertBefore(messageElement, this.elements.form.firstChild);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    };

    // Scroll animations module
    const ScrollAnimations = {
        elements: {},
        
        init() {
            try {
                this.cacheElements();
                this.setupObserver();
            } catch (error) {
                console.error('Scroll animations initialization error:', error);
            }
        },

        cacheElements() {
            this.elements = {
                animatedElements: Utils.$$('.fade-in, .practice-card, .credential-card, .timeline-item')
            };
        },

        setupObserver() {
            if (!window.IntersectionObserver) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            this.elements.animatedElements.forEach(element => {
                element.classList.add('fade-in');
                observer.observe(element);
            });
        }
    };

    // Application controller
    const App = {
        modules: [
            Navigation,
            ThemeToggle,
            StatsCounter,
            TestimonialsCarousel,
            Modal,
            ContactForm,
            ScrollAnimations
        ],
        
        init() {
            try {
                // Wait for DOM to be ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.initializeModules();
                    });
                } else {
                    this.initializeModules();
                }
            } catch (error) {
                console.error('Application initialization error:', error);
            }
        },

        initializeModules() {
            this.modules.forEach(module => {
                try {
                    if (module.init && typeof module.init === 'function') {
                        module.init();
                    }
                } catch (error) {
                    console.error(`Error initializing module:`, error);
                }
            });

            // Add global error handling
            this.setupGlobalErrorHandling();
            
            // Performance monitoring
            this.logPerformanceMetrics();
        },

        setupGlobalErrorHandling() {
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        },

        logPerformanceMetrics() {
            if (window.performance && window.performance.timing) {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const timing = window.performance.timing;
                        const loadTime = timing.loadEventEnd - timing.navigationStart;
                        console.log(`Page load time: ${loadTime}ms`);
                    }, 0);
                });
            }
        }
    };

    // Cleanup function for memory leak prevention
    const cleanup = () => {
        // Stop any running timers
        if (TestimonialsCarousel.autoplayTimer) {
            clearInterval(TestimonialsCarousel.autoplayTimer);
        }
        
        // Remove event listeners if needed
        // This would be called when the page unloads
    };

    // Listen for page unload to cleanup
    window.addEventListener('beforeunload', cleanup);

    // Initialize the application
    App.init();

})();