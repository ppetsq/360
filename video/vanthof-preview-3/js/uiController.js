/**
 * UI controller for managing user interface interactions
 */

class UIController {
    constructor(sceneManager, videoManager) {
        this.sceneManager = sceneManager;
        this.videoManager = videoManager;
        this.currentViewpointIndex = 0;
        this.isUIHidden = false;
        this.isAutoRotating = false;
        this.hasHiddenUIBefore = false;
        this.lastTapTime = 0;
        this.initialLoadComplete = false;
        this.isChangingViewpoint = false;
        this.fadeOverlay = null;
        this.loaderElement = null;
    }
    
    /**
     * Initialize the UI
     */
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Show initial content
        this.updateViewpointInfo();
        
        // Show UI - make sure these are happening
        document.body.classList.add('ui-visible');
        document.body.classList.remove('ui-hidden');
        
        // Make UI overlay visible immediately
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) uiOverlay.style.opacity = '1';
        
        // Show logo
        const logoContainer = document.querySelector('.logo-container');
        if (logoContainer) logoContainer.style.opacity = '1';
        
        // Ensure this is set correctly
        this.isUIHidden = false;
        
        // Fade in overlay
        this.fadeInOverlay();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        const prevButton = UTILS.dom.getElement('prev-viewpoint');
        const nextButton = UTILS.dom.getElement('next-viewpoint');
        
        if (prevButton) prevButton.addEventListener('click', this.goToPreviousViewpoint.bind(this));
        if (nextButton) nextButton.addEventListener('click', this.goToNextViewpoint.bind(this));
        
        // Viewpoint indicator dots
        const dots = UTILS.dom.getElements('.viewpoint-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.changeViewpoint(parseInt(dot.dataset.index));
            });
        });
        
        // Auto-rotate button
        const autoRotateButton = UTILS.dom.getElement('btn-auto-rotate');
        if (autoRotateButton) {
            autoRotateButton.addEventListener('click', this.toggleAutoRotate.bind(this));
        }
        
        // Hide UI button
        const hideUIButton = UTILS.dom.getElement('btn-hide-ui');
        if (hideUIButton) {
            hideUIButton.addEventListener('click', this.toggleUI.bind(this));
        }
        
        // Double tap/click to toggle UI
        document.addEventListener('touchstart', this.handleDoubleTap.bind(this));
        document.addEventListener('click', this.handleDoubleClick.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Initial interaction handler for iOS
        const initialHandler = () => {
            this.videoManager.play();
        };
        
        document.addEventListener('touchstart', initialHandler, { once: true });
        document.addEventListener('click', initialHandler, { once: true });
    }
    
    /**
     * Update viewpoint information in the UI
     */
    updateViewpointInfo() {
        const currentViewpoint = VIEWPOINTS[this.currentViewpointIndex];
        
        // Update title
        const titleElement = UTILS.dom.getElement('viewpoint-title');
        if (titleElement) {
            titleElement.textContent = currentViewpoint.title;
        }
        
        // Update description
        const descriptionElement = UTILS.dom.getElement('description-text');
        if (descriptionElement) {
            descriptionElement.textContent = currentViewpoint.description;
        }
        
        // Update indicator dots
        const dots = UTILS.dom.getElements('.viewpoint-dot');
        dots.forEach(dot => {
            dot.classList.toggle('active', parseInt(dot.dataset.index) === this.currentViewpointIndex);
        });
        
        // Ensure description is visible
        const descriptionContent = document.querySelector('.description-content');
        if (descriptionContent) {
            descriptionContent.style.opacity = '1';
        }
    }
    
    /**
     * Show loader
     */
    showLoader() {
        this.loaderElement = UTILS.dom.getElement('custom-loader');
        if (this.loaderElement) {
            this.loaderElement.style.display = 'flex';
            this.loaderElement.style.opacity = '1';
        }
    }
    
    /**
     * Hide loader
     */
    hideLoader() {
        if (!this.loaderElement) {
            this.loaderElement = UTILS.dom.getElement('custom-loader');
        }
        
        if (this.loaderElement) {
            this.loaderElement.style.opacity = '0';
            
            // Set display:none after fade
            setTimeout(() => {
                if (this.loaderElement) {
                    this.loaderElement.style.display = 'none';
                }
            }, CONFIG.transitions.loaderHideDuration);
        }
    }
    
    /**
     * Get fade overlay element
     */
    getFadeOverlay() {
        if (!this.fadeOverlay) {
            this.fadeOverlay = UTILS.dom.getElement('fade-overlay');
        }
        return this.fadeOverlay;
    }
    
    /**
     * Fade in overlay (make transparent)
     */
    fadeInOverlay() {
        const overlay = this.getFadeOverlay();
        if (overlay) {
            // Ensure transition is applied
            overlay.style.transition = `opacity ${CONFIG.transitions.fadeInDuration}ms ease`;
            overlay.style.opacity = '0';
        }
    }
    
    /**
     * Fade out overlay (make opaque)
     */
    fadeOutOverlay() {
        const overlay = this.getFadeOverlay();
        if (overlay) {
            // Ensure transition is applied
            overlay.style.transition = `opacity ${CONFIG.transitions.fadeOutDuration}ms ease`;
            overlay.style.opacity = '1';
        }
    }
    
    /**
     * Show UI elements
     */
    showUI() {
        document.body.classList.remove('ui-hidden');
        document.body.classList.add('ui-visible');
        
        // Ensure description is visible
        const descriptionContent = document.querySelector('.description-content');
        if (descriptionContent) {
            descriptionContent.style.opacity = '1';
        }
        
        // Hide notification
        const notification = UTILS.dom.getElement('ui-hidden-notification');
        if (notification) {
            notification.style.opacity = '0';
        }
        
        this.isUIHidden = false;
    }
    
    /**
     * Hide UI elements
     */
    hideUI() {
        document.body.classList.remove('ui-visible');
        document.body.classList.add('ui-hidden');
        
        // Show notification if first time
        if (!this.hasHiddenUIBefore) {
            const notification = UTILS.dom.getElement('ui-hidden-notification');
            if (notification) {
                notification.style.opacity = '1';
                
                // Hide notification after delay
                setTimeout(() => {
                    notification.style.opacity = '0';
                }, CONFIG.ui.autoHideTimeout);
                
                this.hasHiddenUIBefore = true;
            }
        }
        
        this.isUIHidden = true;
    }
    
    /**
     * Toggle UI visibility
     */
    toggleUI() {
        if (this.isUIHidden) {
            this.showUI();
        } else {
            this.hideUI();
        }
    }
    
    /**
     * Toggle auto-rotation
     */
    toggleAutoRotate() {
        this.isAutoRotating = this.sceneManager.toggleAutoRotate();
        
        // Update button UI
        const autoRotateButton = UTILS.dom.getElement('btn-auto-rotate');
        if (autoRotateButton) {
            autoRotateButton.classList.toggle('active', this.isAutoRotating);
        }
    }
    
    /**
     * Go to previous viewpoint
     */
    goToPreviousViewpoint() {
        if (this.isChangingViewpoint) return;
        
        const newIndex = this.currentViewpointIndex > 0 
            ? this.currentViewpointIndex - 1 
            : VIEWPOINTS.length - 1;
            
        this.changeViewpoint(newIndex);
    }
    
    /**
     * Go to next viewpoint
     */
    goToNextViewpoint() {
        if (this.isChangingViewpoint) return;
        
        const newIndex = this.currentViewpointIndex < VIEWPOINTS.length - 1 
            ? this.currentViewpointIndex + 1 
            : 0;
            
        this.changeViewpoint(newIndex);
    }
    
/**
 * Change to a specific viewpoint
 */
async changeViewpoint(index) {
    // Don't change to same viewpoint or if change in progress
    if (index === this.currentViewpointIndex || this.isChangingViewpoint) return;
    
    this.isChangingViewpoint = true;
    
    // Remember auto-rotation state
    const wasAutoRotating = this.isAutoRotating;
    
    // Temporarily stop auto-rotation
    if (this.isAutoRotating) {
        this.sceneManager.toggleAutoRotate();
        this.isAutoRotating = false;
    }
    
    // Update current index
    this.currentViewpointIndex = index;
    
    // Update UI info
    this.updateViewpointInfo();
    
    // Fade out screen
    this.fadeOutOverlay();
    
    // Wait for COMPLETE fade out before doing anything
    await new Promise(resolve => setTimeout(resolve, CONFIG.transitions.fadeOutDuration));
    
    // IMPORTANT: Only now, when screen is completely black, reset camera and change video
    this.sceneManager.resetCameraPosition();
    
    // Load new video with appropriate handling based on device
    const success = await this.videoManager.loadVideo(VIEWPOINTS[index].videoUrl);
    
    if (success) {
        // Only preload next video if not on iOS
        if (!UTILS.device.isAnyiOS) {
            const nextIndex = (index + 1) % VIEWPOINTS.length;
            this.videoManager.preloadVideo(VIEWPOINTS[nextIndex].videoUrl);
        }
        
        // Add a small delay to ensure video is ready
        const transitionDelay = UTILS.device.isIOSSafari ? 100 : 50;
        await new Promise(resolve => setTimeout(resolve, transitionDelay));
        
        // Fade in screen
        this.fadeInOverlay();
        
        // Show UI
        this.showUI();
        
        // Restore auto-rotation if needed
        if (wasAutoRotating) {
            setTimeout(() => {
                this.sceneManager.toggleAutoRotate();
                this.isAutoRotating = true;
                
                const autoRotateButton = UTILS.dom.getElement('btn-auto-rotate');
                if (autoRotateButton) {
                    autoRotateButton.classList.add('active');
                }
            }, 500); // Delay to ensure smooth transition
        }
    } else {
        // Show error if video failed to load
        UTILS.errors.showUserError('Failed to load video. Please try again.');
        // Fade back in even on error
        this.fadeInOverlay();
    }
    
    this.isChangingViewpoint = false;
}
    
    /**
     * Handle double tap for mobile
     */
    handleDoubleTap(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;
        
        // Check for double tap (within configured time)
        if (tapLength < CONFIG.ui.doubleTapTimeout && tapLength > 0) {
            // Don't toggle if tapping on a UI element
            const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
            
            if (!isOnUIElement) {
                this.toggleUI();
                event.preventDefault();
            }
        }
        
        this.lastTapTime = currentTime;
    }
    
    /**
     * Handle double click for desktop
     */
    handleDoubleClick(event) {
        const currentTime = new Date().getTime();
        const clickLength = currentTime - this.lastTapTime;
        
        // Check for double click (within configured time)
        if (clickLength < CONFIG.ui.doubleTapTimeout && clickLength > 0) {
            // Don't toggle if clicking on a UI element
            const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
            
            if (!isOnUIElement) {
                this.toggleUI();
                event.preventDefault();
            }
        }
        
        this.lastTapTime = currentTime;
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyPress(event) {
        // Prevent scrolling with arrow keys and space
        if ([27, 32, 37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
        
        // Remove focus from buttons
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
            document.activeElement.blur();
        }
        
        switch (event.keyCode) {
            // Left arrow key
            case 37:
                this.goToPreviousViewpoint();
                break;
                
            // Right arrow key
            case 39:
                this.goToNextViewpoint();
                break;
                
            // Space bar
            case 32:
                this.toggleAutoRotate();
                // Visual feedback
                const rotateButton = UTILS.dom.getElement('btn-auto-rotate');
                if (rotateButton) {
                    rotateButton.classList.add('pressed');
                    setTimeout(() => {
                        rotateButton.classList.remove('pressed');
                    }, 200);
                }
                break;
                
            // Escape key
            case 27:
                this.toggleUI();
                // Visual feedback
                const hideButton = UTILS.dom.getElement('btn-hide-ui');
                if (hideButton) {
                    hideButton.classList.add('pressed');
                    setTimeout(() => {
                        hideButton.classList.remove('pressed');
                    }, 200);
                }
                break;
        }
    }
    
    /**
     * Clean up event listeners and resources
     */
    dispose() {
        // Clean up event listeners
        const prevButton = UTILS.dom.getElement('prev-viewpoint');
        const nextButton = UTILS.dom.getElement('next-viewpoint');
        
        if (prevButton) prevButton.removeEventListener('click', this.goToPreviousViewpoint);
        if (nextButton) nextButton.removeEventListener('click', this.goToNextViewpoint);
        
        const dots = UTILS.dom.getElements('.viewpoint-dot');
        dots.forEach(dot => {
            dot.removeEventListener('click', this.changeViewpoint);
        });
        
        const autoRotateButton = UTILS.dom.getElement('btn-auto-rotate');
        if (autoRotateButton) {
            autoRotateButton.removeEventListener('click', this.toggleAutoRotate);
        }
        
        const hideUIButton = UTILS.dom.getElement('btn-hide-ui');
        if (hideUIButton) {
            hideUIButton.removeEventListener('click', this.toggleUI);
        }
        
        document.removeEventListener('touchstart', this.handleDoubleTap);
        document.removeEventListener('click', this.handleDoubleClick);
        document.removeEventListener('keydown', this.handleKeyPress);
    }
}