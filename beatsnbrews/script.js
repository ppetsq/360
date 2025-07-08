// Beats & Brews Festival - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initHeroAnimations();
    initScrollEffects();
    initStampCard();
    initEmailSignup();
    initLoadingAnimations();
    initParallaxEffects();
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
    const stamps = document.querySelectorAll('.stamp');
    const stampSound = createAudioContext();
    
    stamps.forEach(stamp => {
        stamp.addEventListener('click', function() {
            toggleStamp(this);
            playStampSound();
        });

        stamp.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
        });

        stamp.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    function toggleStamp(stamp) {
        stamp.classList.toggle('stamped');
        
        // Add animation
        stamp.style.animation = 'stamp-animation 0.5s ease';
        
        setTimeout(() => {
            stamp.style.animation = '';
        }, 500);

        // Check if all stamps are collected
        checkAllStampsCollected();
    }

    function checkAllStampsCollected() {
        const allStamps = document.querySelectorAll('.stamp');
        const stampedStamps = document.querySelectorAll('.stamp.stamped');
        
        if (allStamps.length === stampedStamps.length) {
            showStampCompletionMessage();
        }
    }

    function showStampCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'stamp-completion';
        message.innerHTML = `
            <div class="completion-content">
                <h3>🎉 Brewery Passport Complete!</h3>
                <p>You've discovered all participating breweries!</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    function createAudioContext() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext;
    }

    function playStampSound() {
        // Simple sound effect using Web Audio API
        if (stampSound && stampSound.state === 'running') {
            const oscillator = stampSound.createOscillator();
            const gainNode = stampSound.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(stampSound.destination);
            
            oscillator.frequency.setValueAtTime(800, stampSound.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, stampSound.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, stampSound.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, stampSound.currentTime + 0.1);
            
            oscillator.start(stampSound.currentTime);
            oscillator.stop(stampSound.currentTime + 0.1);
        }
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
            showNotification('Thanks for signing up! Check your email for the discount code.', 'success');
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

// Additional CSS for animations
const additionalStyles = `
    <style>
        @keyframes stamp-animation {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        
        .stamp-completion {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #FFAC3C;
            color: #1a1a1a;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            z-index: 3000;
            animation: celebration 0.5s ease;
        }
        
        @keyframes celebration {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        
        .notification.success {
            background: #4CAF50;
        }
        
        .notification.error {
            background: #F44336;
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