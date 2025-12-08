// IQ Sähkö Phase 1 Approval Site
// Tab Navigation Script

document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links and tab contents
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to switch tabs
    function switchTab(targetTab) {
        // Remove active class from all nav links and tab contents
        navLinks.forEach(link => link.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked nav link
        const activeLink = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Show corresponding tab content
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        // Update URL hash without scrolling
        history.pushState(null, null, `#${targetTab}`);
        
        // Scroll to top of content area
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Handle initial page load with hash
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        switchTab(hash);
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchTab(hash);
        } else {
            switchTab('logo');
        }
    });
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Get current active tab index
        const activeLink = document.querySelector('.nav-link.active');
        if (!activeLink) return;
        
        const allLinks = Array.from(navLinks);
        const currentIndex = allLinks.indexOf(activeLink);
        
        // Arrow up - previous tab
        if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            const prevTab = allLinks[currentIndex - 1].getAttribute('data-tab');
            switchTab(prevTab);
        }
        
        // Arrow down - next tab
        if (e.key === 'ArrowDown' && currentIndex < allLinks.length - 1) {
            e.preventDefault();
            const nextTab = allLinks[currentIndex + 1].getAttribute('data-tab');
            switchTab(nextTab);
        }
    });
    
    // Add smooth scroll behavior for any in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });
});

// Optional: Add analytics tracking for tab views
function trackTabView(tabName) {
    // Add your analytics code here
    // Example: gtag('event', 'tab_view', { tab_name: tabName });
    console.log('Tab viewed:', tabName);
}

// ===== MOBILE MENU FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-active');
            menuToggle.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (sidebar.classList.contains('mobile-active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('mobile-active') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// ===== LOGO MODAL FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('logoModal');
    const clickableCards = document.querySelectorAll('.concept-card.clickable');
    const modalClose = document.querySelector('.modal-close');
    const modalPrev = document.querySelector('.modal-prev');
    const modalNext = document.querySelector('.modal-next');
    const modalLogos = document.querySelectorAll('.modal-logo');
    let currentIndex = 0;

    // Show modal logo at specific index
    function showModalLogo(index) {
        modalLogos.forEach(logo => logo.classList.remove('active'));
        modalLogos[index].classList.add('active');
        currentIndex = index;
    }

    // Open modal
    clickableCards.forEach(card => {
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-logo-index'));
            modal.classList.add('active');
            showModalLogo(index);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    modalClose.addEventListener('click', closeModal);

    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('modal-content')) {
            closeModal();
        }
    });

    // Previous logo
    modalPrev.addEventListener('click', function() {
        const newIndex = (currentIndex - 1 + modalLogos.length) % modalLogos.length;
        showModalLogo(newIndex);
    });

    // Next logo
    modalNext.addEventListener('click', function() {
        const newIndex = (currentIndex + 1) % modalLogos.length;
        showModalLogo(newIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            modalPrev.click();
        } else if (e.key === 'ArrowRight') {
            modalNext.click();
        }
    });
});

// ===== IMAGE MODAL FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    const imageModal = document.getElementById('imageModal');
    if (!imageModal) return; // Exit if modal doesn't exist

    const clickableImageCards = document.querySelectorAll('.image-card.clickable');
    const imageModalClose = imageModal.querySelector('.modal-close');
    const imageModalPrev = imageModal.querySelector('.modal-prev');
    const imageModalNext = imageModal.querySelector('.modal-next');
    const modalImages = imageModal.querySelectorAll('.modal-image');
    let currentImageIndex = 0;

    // Show modal image at specific index
    function showModalImage(index) {
        modalImages.forEach(img => img.classList.remove('active'));
        modalImages[index].classList.add('active');
        currentImageIndex = index;
    }

    // Open image modal
    clickableImageCards.forEach(card => {
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-image-index'));
            imageModal.classList.add('active');
            showModalImage(index);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });
    });

    // Close image modal
    function closeImageModal() {
        imageModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    imageModalClose.addEventListener('click', closeImageModal);

    // Close on background click
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target.classList.contains('modal-content')) {
            closeImageModal();
        }
    });

    // Previous image
    imageModalPrev.addEventListener('click', function() {
        const newIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
        showModalImage(newIndex);
    });

    // Next image
    imageModalNext.addEventListener('click', function() {
        const newIndex = (currentImageIndex + 1) % modalImages.length;
        showModalImage(newIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!imageModal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeImageModal();
        } else if (e.key === 'ArrowLeft') {
            imageModalPrev.click();
        } else if (e.key === 'ArrowRight') {
            imageModalNext.click();
        }
    });
});