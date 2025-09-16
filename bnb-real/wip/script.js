// Beats and Brews Festival - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initHeroAnimations();
    initScrollEffects();
    // initStampCard(); // Removed - no longer using passport system
    initEmailSignup();
    initLoadingAnimations();
    initParallaxEffects();
    // initTimeline(); // Removed - using simple grid now
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navigation visibility on scroll
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        if (window.scrollY > 100) {
            nav.classList.add('visible');
            nav.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            nav.classList.remove('visible');
            nav.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    });
}

// Hero section animations
function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');
    
    // Animate hero content on load
    setTimeout(() => {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }, 500);

    // Hero parallax effect
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroVideo = document.querySelector('.hero-video video');
        
        if (hero && heroVideo) {
            heroVideo.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Scroll effects and animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);

    // Observe all sections for loading animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('loading');
        observer.observe(section);
    });

    // Animate cards on scroll
    const cards = document.querySelectorAll('.event-card, .artist-card, .unique-item');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Interactive stamp card functionality
function initStampCard() {
    const passportBook = document.querySelector('.passport-book');
    const passportCover = document.querySelector('.passport-cover');
    const stampSlots = document.querySelectorAll('.stamp-slot');
    const progressFill = document.getElementById('progress-fill');
    const progressCount = document.getElementById('progress-count');
    const completionModal = document.getElementById('completion-modal');
    const completionClose = document.querySelector('.completion-close');
    const completionForm = document.getElementById('completion-form');
    
    let stampedCount = 0;
    const totalStamps = stampSlots.length;
    let isPassportOpen = false;

    // Passport cover click handler
    passportCover.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePassport();
    });

    // Keyboard support for passport cover
    passportCover.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            togglePassport();
        }
    });

    // Close passport when clicking outside or inside (but not on stamps)
    document.addEventListener('click', function(e) {
        if (isPassportOpen) {
            // Check if click is outside passport book
            if (!passportBook.contains(e.target)) {
                closePassport();
            } 
            // Or if click is inside passport but not on a stamp slot
            else if (passportBook.contains(e.target) && !e.target.closest('.stamp-slot')) {
                closePassport();
            }
        }
    });

    function togglePassport() {
        if (isPassportOpen) {
            closePassport();
        } else {
            openPassport();
        }
    }

    function openPassport() {
        passportBook.classList.add('open');
        isPassportOpen = true;
        
        // Update accessibility attributes
        passportCover.setAttribute('aria-label', 'Close brewery passport');
        passportCover.setAttribute('aria-expanded', 'true');
        
        // Add a small delay before enabling stamp interactions
        setTimeout(() => {
            stampSlots.forEach(slot => {
                slot.style.pointerEvents = 'auto';
            });
        }, 400);
    }

    function closePassport() {
        passportBook.classList.remove('open');
        isPassportOpen = false;
        
        // Update accessibility attributes
        passportCover.setAttribute('aria-label', 'Open brewery passport to start collecting stamps');
        passportCover.setAttribute('aria-expanded', 'false');
        
        // Disable stamp interactions when closed
        stampSlots.forEach(slot => {
            slot.style.pointerEvents = 'none';
        });
    }

    // Initially disable stamp interactions
    stampSlots.forEach(slot => {
        slot.style.pointerEvents = 'none';
    });
    
    // Initialize stamp interactions
    stampSlots.forEach((slot, index) => {
        slot.addEventListener('click', function() {
            if (!this.classList.contains('stamped')) {
                stampStamp(this, index);
            }
        });

        // Keyboard support for accessibility
        slot.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && !this.classList.contains('stamped')) {
                e.preventDefault();
                stampStamp(this, index);
            }
        });

        slot.addEventListener('mouseenter', function() {
            if (!this.classList.contains('stamped')) {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.filter = 'brightness(1.1)';
            }
        });

        slot.addEventListener('mouseleave', function() {
            if (!this.classList.contains('stamped')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.filter = 'brightness(1)';
            }
        });

        // Focus styles for keyboard navigation
        slot.addEventListener('focus', function() {
            if (!this.classList.contains('stamped')) {
                this.style.transform = 'translateY(-3px) scale(1.01)';
                this.style.filter = 'brightness(1.05)';
            }
        });

        slot.addEventListener('blur', function() {
            if (!this.classList.contains('stamped')) {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.filter = 'brightness(1)';
            }
        });
    });

    // Completion modal handlers
    completionClose.addEventListener('click', closeCompletionModal);
    completionModal.addEventListener('click', function(e) {
        if (e.target === completionModal) {
            closeCompletionModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && completionModal.classList.contains('active')) {
            closeCompletionModal();
        }
    });

    completionForm.addEventListener('submit', handleCompletionSignup);

    function stampStamp(slot, index) {
        // Mark as stamped
        slot.classList.add('stamped');
        stampedCount++;
        
        // Update aria-label for accessibility
        const breweryName = slot.querySelector('.brewery-name').textContent;
        slot.setAttribute('aria-label', `${breweryName} stamp collected. Brewery completed.`);
        slot.setAttribute('aria-pressed', 'true');
        
        // Create dramatic stamp animation
        const stampIndentation = slot.querySelector('.stamp-indentation');
        const stampOverlay = slot.querySelector('.stamp-overlay');
        
        // Press down animation
        stampIndentation.style.transform = 'translateY(8px) scale(0.95)';
        stampIndentation.style.boxShadow = 'inset 0 8px 20px rgba(0,0,0,0.6), inset 0 -1px 4px rgba(255,255,255,0.2), 0 0 5px rgba(0,0,0,0.1)';
        
        // Add staggered delay for visual impact
        setTimeout(() => {
            // Stamp reveals with ink effect
            stampOverlay.style.opacity = '1';
            stampOverlay.style.transform = 'scale(1) rotateZ(0deg)';
            
            // Ink spreading animation
            const inkEffect = slot.querySelector('.stamp-ink-effect');
            inkEffect.style.opacity = '1';
            
            // Release press animation
            setTimeout(() => {
                stampIndentation.style.transform = 'translateY(0) scale(1)';
                stampIndentation.style.boxShadow = 'inset 0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)';
            }, 150);
            
        }, 200 + (index * 100)); // Staggered reveal
        
        // Update progress
        updateProgress();
        
        // Check for completion
        if (stampedCount === totalStamps) {
            setTimeout(() => {
                showCompletionModal();
            }, 1000);
        }
    }

    function updateProgress() {
        const percentage = (stampedCount / totalStamps) * 100;
        progressFill.style.width = percentage + '%';
        progressCount.textContent = stampedCount;
        
        // Update progress bar accessibility attributes
        const progressBar = document.querySelector('.progress-bar');
        progressBar.setAttribute('aria-valuenow', stampedCount);
        
        // Announce progress to screen readers
        const announcer = document.getElementById('progress-announcer');
        if (announcer) {
            announcer.textContent = `${stampedCount} of ${totalStamps} brewery stamps collected.`;
        }
        
        // Add celebratory effect when progress increases
        progressFill.style.boxShadow = '0 0 15px rgba(234, 196, 53, 0.8)';
        setTimeout(() => {
            progressFill.style.boxShadow = '0 0 8px rgba(234, 196, 53, 0.4)';
        }, 300);
    }

    function showCompletionModal() {
        completionModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Trigger celebration animations
        const sparkles = document.querySelectorAll('.sparkle');
        sparkles.forEach((sparkle, index) => {
            sparkle.style.animationDelay = (index * 0.3) + 's';
        });
    }

    function closeCompletionModal() {
        completionModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function handleCompletionSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        // Basic email validation
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.textContent = 'Processing...';
        button.disabled = true;
        
        setTimeout(() => {
            showNotification('Welcome to our community!', 'success');
            form.reset();
            button.textContent = originalText;
            button.disabled = false;
            
            setTimeout(() => {
                closeCompletionModal();
            }, 1500);
        }, 1500);
    }


    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Email signup functionality
function initEmailSignup() {
    const signupBtn = document.getElementById('signup-btn');
    const signupModal = document.getElementById('signup-modal');
    const modalClose = document.querySelector('.modal-close');
    const signupForm = document.getElementById('signup-form');
    const modalForm = document.getElementById('modal-form');

    // Open modal
    signupBtn.addEventListener('click', function() {
        signupModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && signupModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        signupModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Form submissions
    signupForm.addEventListener('submit', handleSignup);
    modalForm.addEventListener('submit', handleSignup);

    function handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        // Basic email validation
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        
        button.textContent = 'Signing up...';
        button.disabled = true;
        
        setTimeout(() => {
            // Simulate successful signup
            showNotification('Thanks for signing up! Stay tuned for festival updates.', 'success');
            form.reset();
            button.textContent = originalText;
            button.disabled = false;
            
            if (signupModal.classList.contains('active')) {
                closeModal();
            }
        }, 1500);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Loading animations
function initLoadingAnimations() {
    // Stagger animation for artist cards
    const artistCards = document.querySelectorAll('.artist-card');
    artistCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Stagger animation for unique items
    const uniqueItems = document.querySelectorAll('.unique-item');
    uniqueItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Animate stamps on scroll
    const stamps = document.querySelectorAll('.stamp');
    stamps.forEach((stamp, index) => {
        stamp.style.animationDelay = `${index * 0.1}s`;
    });
}

// Parallax effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
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
}

// Performance optimization
const optimizedScroll = throttle(function() {
    // Scroll-based animations
    const scrolled = window.pageYOffset;
    const heroVideo = document.querySelector('.hero-video video');
    
    if (heroVideo) {
        heroVideo.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
}, 16);

window.addEventListener('scroll', optimizedScroll);

// Timeline animations
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (window.innerWidth <= 1024) {
        // Mobile/tablet fade-in animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        timelineItems.forEach((item, index) => {
            // Stagger the animation delays
            item.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(item);
        });
    }
    
    // Add scroll-based glow effect on desktop
    if (window.innerWidth > 1024) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const scheduleSection = document.querySelector('.schedule');
            
            if (scheduleSection) {
                const rect = scheduleSection.getBoundingClientRect();
                const isInView = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isInView) {
                    timelineItems.forEach((item, index) => {
                        const delay = index * 100;
                        setTimeout(() => {
                            item.style.transform = 'translateY(-2px)';
                            item.querySelector('.timeline-time').style.boxShadow = '0 6px 20px rgba(0,0,0,0.3), 0 0 15px rgba(234, 196, 53, 0.4)';
                        }, delay);
                    });
                }
            }
        });
    }
}

// Additional CSS for animations that weren't covered in main styles
const additionalStyles = `
    <style>
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0;
            color: white;
            font-weight: 600;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: 'Bebas Neue', cursive;
            letter-spacing: 1px;
            text-transform: uppercase;
            clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%);
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }
        
        .notification.success {
            background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
            border: 2px solid #66BB6A;
        }
        
        .notification.error {
            background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
            border: 2px solid #EF5350;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .hero-content {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease;
        }
        
        .loading {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .loading.loaded {
            opacity: 1;
            transform: translateY(0);
        }
        
        @media (max-width: 768px) {
            .notification {
                left: 20px;
                right: 20px;
                transform: translateY(-100%);
            }
            
            .notification.show {
                transform: translateY(0);
            }
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);