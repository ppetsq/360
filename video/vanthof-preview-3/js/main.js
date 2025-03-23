/**
 * Main application entry point
 * Orchestrates the 360° experience initialization
 */

// Set up mobile viewport height
function setupMobileViewportHeight() {
    // Fix for mobile 100vh issues
    function setVh() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set initial value
    setVh();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
}

// Main application class
class VanHof360Experience {
    constructor() {
        this.sceneManager = null;
        this.videoManager = null;
        this.uiController = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loader
            const loader = document.getElementById('custom-loader');
            if (loader) {
                loader.style.display = 'flex';
                loader.style.opacity = '1';
            }
            
            // Set up mobile viewport
            setupMobileViewportHeight();
            
            // Initialize managers
            this.sceneManager = new SceneManager();
            const sceneInitialized = this.sceneManager.init();
            
            if (!sceneInitialized) {
                throw new Error('Failed to initialize 3D scene');
            }
            
            this.videoManager = new VideoManager(this.sceneManager);
            this.uiController = new UIController(this.sceneManager, this.videoManager);
            
            // Initialize UI
            this.uiController.init();
            
            // Load first viewpoint
            const firstVideoLoaded = await this.videoManager.loadVideo(VIEWPOINTS[0].videoUrl);
            
            if (!firstVideoLoaded) {
                throw new Error('Failed to load first video');
            }
            
            // Preload next video for smoother transitions
            this.videoManager.preloadVideo(VIEWPOINTS[1].videoUrl);
            
            // Hide loader
            this.uiController.hideLoader();
            
            // Show UI
            this.uiController.showUI();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log('Van\'t Hof 360° experience initialized');
            
            return true;
        } catch (error) {
            UTILS.errors.logError(error, 'Initialization failed');
            UTILS.errors.showUserError('Failed to initialize 360° experience');
            return false;
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.uiController) {
            this.uiController.dispose();
            this.uiController = null;
        }
        
        if (this.videoManager) {
            this.videoManager.dispose();
            this.videoManager = null;
        }
        
        if (this.sceneManager) {
            this.sceneManager.dispose();
            this.sceneManager = null;
        }
        
        this.initialized = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new VanHof360Experience();
    app.init().catch(error => {
        console.error('Failed to initialize application:', error);
    });
    
    // Store instance for debugging
    window.vanHof360App = app;
});