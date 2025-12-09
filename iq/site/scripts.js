/* =================================================================
   IQ Sähkö - Scripts
   ================================================================= */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initParallax();
});

/* =================================================================
   Mobile Menu Toggle
   ================================================================= */

function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        // Toggle menu
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu when clicking any link
        const allLinks = navMenu.querySelectorAll('.nav-link, .dropdown-link, .nav-cta');
        allLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking overlay
        navMenu.addEventListener('click', (e) => {
            if (e.target === navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

/* =================================================================
   Scroll Animations (Intersection Observer)
   ================================================================= */

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally, stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements that should fade in
    const elementsToAnimate = document.querySelectorAll(`
        .benefit-card,
        .service-card,
        .process-step,
        .reference-card,
        .news-card,
        .section-header
    `);

    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/* =================================================================
   Smooth Scroll
   ================================================================= */

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* =================================================================
   Sticky Header on Scroll
   ================================================================= */

let lastScroll = 0;
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class when scrolled
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

/* =================================================================
   Parallax Effect
   ================================================================= */

function initParallax() {
    const heroImg = document.querySelector('.hero-bg img');
    const ctaImg = document.querySelector('.cta-bg img');

    if (!heroImg && !ctaImg) return;

    function updateParallax() {
        const scrolled = window.pageYOffset;

        // Hero parallax - simple and smooth
        if (heroImg) {
            const heroSection = heroImg.closest('.hero');
            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                if (scrolled < heroHeight) {
                    const yPos = scrolled * 0.5;
                    heroImg.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            }
        }

        // CTA parallax - only when visible
        if (ctaImg) {
            const ctaSection = ctaImg.closest('.cta-section');
            if (ctaSection) {
                const rect = ctaSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Check if CTA section is in viewport
                if (rect.top < windowHeight && rect.bottom > 0) {
                    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                    const yPos = progress * 100;
                    ctaImg.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            }
        }
    }

    // Use passive listener for better performance
    window.addEventListener('scroll', updateParallax, { passive: true });

    // Initial call
    updateParallax();
}
