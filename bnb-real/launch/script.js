// Beats and Brews Festival - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top on page load to prevent jump
    window.scrollTo(0, 0);

    // Initialize all components
    initNavigation();
    initHeroAnimations();
    initScrollEffects();
    initEmailSignup();
    initLoadingAnimations();
    initParallaxEffects();
    initArtistModal();
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
            const targetId = this.getAttribute('href');

            // Skip smooth scrolling for external links
            if (targetId.startsWith('http://') || targetId.startsWith('https://')) {
                return; // Let the browser handle external links normally
            }

            e.preventDefault();
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
    const cards = document.querySelectorAll('.artist-card, .unique-item');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Email signup functionality
function initEmailSignup() {
    const signupForm = document.getElementById('signup-form');
    const modalForm = document.getElementById('modal-form');

    // Form submissions - let Formspree handle the actual submission
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    if (modalForm) {
        modalForm.addEventListener('submit', handleSignup);
    }

    function handleSignup(e) {
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        // Basic email validation
        if (!isValidEmail(email)) {
            e.preventDefault();
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Show submitting state
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Submitting...';
        button.disabled = true;

        // Let the form submit naturally to Formspree
        // Don't prevent default - let it go through

        // Re-enable button after a delay (in case user stays on page)
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 3000);
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

// Scroll to hero section function
function scrollToHero() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Notification styles
const notificationStyles = `
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

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Artist data
const artists = {
    'henri-gorr': {
        name: "Henri Gorr",
        genre: "Deep House • Melodic House",
        image: "https://files.petsq.works/beatsnbrews/henri-000.jpg",
        bio: "Classical training meets contemporary sound. German producer crafting deep house and melodic house with musical depth that comes from years at the orchestra before ever touching a mixer. Designed to inspire and ground you.",
        instagram: "https://www.instagram.com/henri_gorr/"
    },
    'doris-bae': {
        name: "Doris Bae",
        genre: "Urban • Dancehall • Afro",
        image: "https://files.petsq.works/beatsnbrews/doris-00.jpg",
        bio: "Doris Bae brings the heat to Stadshaven! Jazz pianist's daughter who's lit up stages like Milkshake Festival, Zwarte Cross, and toured internationally with Ronnie Flex. Urban-dancehall-afro vibes that turn every crowd into pure energy.",
        instagram: "https://www.instagram.com/dorissbae/",
        soundcloud: "https://soundcloud.com/club-turn/dorisbae-djset"
    },
    'kid-kiddo': {
        name: "Kid Kiddo",
        genre: "Baile Funk • Afro Funk • Jersey",
        image: "https://files.petsq.works/beatsnbrews/kid-00.jpg",
        bio: "Kid Kiddo brings Curaçao energy to Rotterdam. Born in the Caribbean, raised in the city. High-energy Baile Funk, Afro Funk, Jersey, Dembow & Bouyon sounds that pull crowds into pure movement.",
        instagram: "https://www.instagram.com/officialkidkiddo/"
    },
    'matte': {
        name: "MATTE",
        genre: "Techno • Uplifting Grooves",
        image: "https://files.petsq.works/beatsnbrews/matte-00.jpg",
        bio: "Born in Italy and settled in Rotterdam, blending spacey atmospheres with intense techno kicks and uplifting grooves. Sets built for that moment when the bass drops and everything else disappears.",
        instagram: "https://www.instagram.com/matte.13/",
        spotify: "https://open.spotify.com/artist/66E33Ed362Q7MeNjwyovVk"
    },
    'petsq': {
        name: "petsq",
        genre: "House • Electronica",
        image: "https://files.petsq.works/beatsnbrews/petsq-00.jpg",
        bio: "petsq brings the feels. Finnish producer based in Rotterdam, crafting house and electronica that bends in unexpected ways. His biweekly show 'OFFBEAT' on Radio WORM spans genres with emotional depth and twisted rhythms.",
        instagram: "https://www.instagram.com/petsq010",
        soundcloud: "https://soundcloud.com/petsq010/bloom"
    },
    'percy-thrills': {
        name: "Percy Thrills",
        genre: "Funky Soul • Afrobeat • Disco House",
        image: "https://files.petsq.works/beatsnbrews/percy-000.jpg",
        bio: "Percy blends an eclectic mix of funky soul, Afrobeat, and disco house into seamless, feel-good sets that guarantee to keep you dancing.",
        instagram: "https://www.instagram.com/percythrillz/"
    },
    'electronic-visions': {
        name: "Electronic Visions",
        genre: "Ambient • Synthwave • Electronic",
        image: "https://files.petsq.works/beatsnbrews/ev-00.jpg",
        bio: "Music that feels like floating through memories you wish you had. Warm synths, nostalgic waves, and ambient textures that make time move in a completely different way.",
        instagram: "https://www.instagram.com/electronicvisions/",
        spotify: "https://open.spotify.com/artist/3hjM20WPb34IxZEvOIh0e2"
    },
    'partners-in-crime': {
        name: "PARTNERS IN CRIME (COL)",
        genre: "Tech House • Latin Tech • Deep Tech",
        image: "https://files.petsq.works/beatsnbrews/pic-00.jpg",
        bio: "Born in Colombia and raised in Mallorca, creating a unique fusion of tech house, latin tech, minimal deep-tech and house. This set will pulse with rhythm, colour, and a drive to connect beyond the dancefloor.",
        instagram: "https://www.instagram.com/partnersincrime.col/"
    }
};

// Beer data
const beers = {
    'limoncello-neipa': {
        name: "Limoncello Neipa",
        type: "NEIPA",
        abv: "5.8% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-06-neipa.jpg",
        description: "Brewed in collaboration with Lemon Spirit from Den Haag, this creation bursts with fresh citrus and bold hops. Crafted with recycled lemon peels from limoncello production."
    },
    'octopus-blonde': {
        name: "Octopus Blonde",
        type: "Blonde",
        abv: "6.0% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-03-blond.jpg",
        description: "Blonde beer with kiwi berry and blood orange twist, hint of juniper. A refreshing and fruity experience that balances traditional blonde characteristics with innovative flavor additions."
    },
    'devils-fruit': {
        name: "Devil's Fruit",
        type: "Fruit Beer",
        abv: "3.8% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-02-devil.jpg",
        description: "Fruit beer with cherry, raspberry & black currant. A lower alcohol option that doesn't compromise on flavor, delivering a rich berry experience with perfect balance."
    },
    'great-white': {
        name: "Great White",
        type: "Wheat Beer",
        abv: "5.3% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-01-white.jpg",
        description: "Wheat beer with grapefruit and orange. Classic wheat beer style enhanced with citrus notes that provide a crisp, refreshing taste perfect for any occasion."
    },
    'moray-ipa': {
        name: "Moray IPA non-alc",
        type: "Non-Alcoholic",
        abv: "0.4% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-05-moray.jpg",
        description: "Non-alcoholic IPA with tangerine and carambola. Proof that great taste doesn't require alcohol - all the hoppy character and citrus complexity you expect from an IPA."
    },
    'bock-rammer': {
        name: "Bock Rammer",
        type: "Limited Edition",
        abv: "7.8% ABV",
        image: "https://files.petsq.works/beatsnbrews/beers/beer-04-bock.jpg",
        description: "Dark double bock with caramel tones. A rich, malty masterpiece with deep flavors and higher alcohol content. This limited edition beer showcases traditional brewing mastery."
    }
};

// Global functions for opening modals
function openArtist(artistId) {
    const artist = artists[artistId];
    if (!artist) return;

    // Set up navigation context for artists
    currentModalType = 'artist';
    modalItems = Object.keys(artists);
    currentModalIndex = modalItems.indexOf(artistId);

    populateModal(artist, 'artist');
}

function openBeer(beerId) {
    const beer = beers[beerId];
    if (!beer) return;

    // Set up navigation context for beers
    currentModalType = 'beer';
    modalItems = Object.keys(beers);
    currentModalIndex = modalItems.indexOf(beerId);

    populateModal(beer, 'beer');
}

// Helper function to populate modal content
function populateModal(item, type) {
    const modal = document.getElementById('artist-modal');
    const modalImg = document.getElementById('artist-modal-img');
    const modalName = document.getElementById('artist-modal-name');
    const modalGenre = document.getElementById('artist-modal-genre');
    const modalBio = document.getElementById('artist-modal-bio');
    const modalSocial = document.getElementById('artist-modal-social');

    if (!modal || !modalImg || !modalName || !modalGenre || !modalBio || !modalSocial) {
        return;
    }

    // Populate modal content
    modalImg.src = item.image;
    modalImg.alt = item.name;
    modalName.textContent = item.name;

    if (type === 'artist') {
        modalGenre.textContent = item.genre;
        modalBio.textContent = item.bio;

        // Clear and populate social links
        modalSocial.innerHTML = '';

        if (item.instagram) {
            const instagramLink = createSocialLink(item.instagram, 'Instagram', 'https://files.petsq.works/beatsnbrews/ig.svg');
            modalSocial.appendChild(instagramLink);
        }

        if (item.soundcloud) {
            const soundcloudLink = createSocialLink(item.soundcloud, 'SoundCloud', 'https://files.petsq.works/beatsnbrews/soundcloud.svg');
            modalSocial.appendChild(soundcloudLink);
        }

        if (item.spotify) {
            const spotifyLink = createSocialLink(item.spotify, 'Spotify', 'https://files.petsq.works/beatsnbrews/spotify.svg');
            modalSocial.appendChild(spotifyLink);
        }
    } else if (type === 'beer') {
        modalGenre.textContent = `${item.type} • ${item.abv}`;
        modalBio.textContent = item.description;
        modalSocial.innerHTML = '';
    }

    // Show modal and prevent scrolling
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update navigation buttons
    updateNavigationButtons();
}

// Helper function to create social links
function createSocialLink(url, platform, iconUrl) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'social-link';
    link.innerHTML = `<span class="social-icon"><img src="${iconUrl}" alt="${platform}" width="20" height="20"></span>${platform}`;
    return link;
}

// Close modal function
window.closeArtistModal = function() {
    const modal = document.getElementById('artist-modal');
    const modalContent = document.querySelector('.artist-modal-content');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        if (modalContent) {
            modalContent.style.transform = '';
        }
        modal.style.backgroundColor = '';

        // Reset navigation context
        currentModalType = null;
        modalItems = [];
        currentModalIndex = 0;
    }
}

// Global variables for modal navigation
let currentModalType = null;
let currentModalIndex = 0;
let modalItems = [];

// Artist modal functionality
function initArtistModal() {
    const modal = document.getElementById('artist-modal');
    const modalContent = document.querySelector('.artist-modal-content');

    // ESC key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal && modal.classList.contains('active')) {
                closeArtistModal();
            }
        }
    });

    // Click anywhere on modal content to close (but not on links, buttons, or close button)
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            if (e.target.closest('a') || e.target.closest('.modal-close') || e.target.closest('.modal-nav')) {
                return;
            }
            closeArtistModal();
        });
    }

    // Click outside modal content to close
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeArtistModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (canNavigate()) {
                navigateModal('prev');
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (canNavigate()) {
                navigateModal('next');
            }
        }
    });

    // Touch event handling for navigation buttons
    const setupNavigationTouchEvents = () => {
        const prevBtn = document.getElementById('modal-nav-prev');
        const nextBtn = document.getElementById('modal-nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            prevBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (canNavigate()) {
                    navigateModal('prev');
                }
            }, { passive: false });
        }

        if (nextBtn) {
            nextBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            nextBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (canNavigate()) {
                    navigateModal('next');
                }
            }, { passive: false });
        }
    };

    // Setup touch events after DOM is ready
    setupNavigationTouchEvents();
}

// Check if navigation is possible
function canNavigate() {
    return modalItems.length > 1;
}

// Navigate between modal items with infinite looping
let navigationThrottle = false;
function navigateModal(direction) {
    if (!modalItems.length || navigationThrottle) return;

    // Throttle navigation to prevent rapid-fire issues
    navigationThrottle = true;
    setTimeout(() => {
        navigationThrottle = false;
    }, 300);

    const modal = document.getElementById('artist-modal');
    const modalContent = document.querySelector('.artist-modal-content');

    if (direction === 'next') {
        currentModalIndex++;
        if (currentModalIndex >= modalItems.length) {
            currentModalIndex = 0;
        }
    } else if (direction === 'prev') {
        currentModalIndex--;
        if (currentModalIndex < 0) {
            currentModalIndex = modalItems.length - 1;
        }
    }

    // Reset visual feedback
    modal.style.backgroundColor = '';
    modalContent.style.transform = '';

    // Get the current item
    const currentItem = modalItems[currentModalIndex];

    // Open the appropriate modal type
    if (currentModalType === 'artist') {
        openArtist(currentItem);
    } else if (currentModalType === 'beer') {
        openBeer(currentItem);
    }
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.getElementById('modal-nav-prev');
    const nextBtn = document.getElementById('modal-nav-next');

    if (!prevBtn || !nextBtn) return;

    // Always show navigation buttons
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';

    if (modalItems.length <= 1) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }
}