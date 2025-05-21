<?php
/**
 * Template Name: 360 Experience
 * Description: A custom template for the 360 experience with no WordPress headers/footers
 */

// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Output your HTML directly without WordPress headers/footers
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Van 't Hof Production Line - 360° Experience</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Oswald:wght@700&display=swap" rel="stylesheet">
    
<style>

/* Base Reset and Global Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: #000;
    color: #fff;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    cursor: default;
}

/* Layout and Container Styles */
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
}

#video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: auto;
    background: black;
}

canvas {
    width: 100% !important;
    height: 100% !important;
}

/* UI Overlay and Centered Content */
.ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
    transition: opacity 0.5s ease;
    opacity: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.centered-content {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px; /* KEY PARAMETER: Controls spacing between main UI sections */
    padding: 20px;
}

/* Logo Styles */
.logo-container {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    z-index: 5;
    transition: opacity 0.5s ease;
    opacity: 0;
    pointer-events: auto;
    margin-bottom: -10px; /* KEY PARAMETER: Adjust to pull content closer to logo */
}

.logo {
    height: 150px; /* KEY PARAMETER: Size of logo */
    width: auto;
    opacity: 0.85;
    filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.5));
    transition: opacity 0.3s ease, transform 0.3s ease;
    cursor: pointer;
}

.logo:hover {
    opacity: 1;
    transform: scale(1.05);
}

/* Content Section (Title and Description) */
.content-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 600px;
    gap: 35px; /* KEY PARAMETER: Space between title and description */
    text-align: center;
}

/* Title Styles */
.title-bar {
    margin-bottom: 0;
    pointer-events: none;
}

.title-bar h1 {
    font-family: 'Oswald', sans-serif;
    font-size: 4rem; /* KEY PARAMETER: Title text size */
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
    line-height: 1;
    transition: opacity 0.3s ease;
    user-select: none;
}

/* Description Styles */
.description-container {
    position: relative;
    margin-bottom: 0;
    width: 100%;
    max-width: 600px;
}

.description-blur {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0);
    transition: background-color 0.5s ease;
    z-index: 1;
}

.ui-visible .description-blur {
    background-color: rgba(0, 0, 0, 0.3);
}

.description-content {
    position: relative;
    z-index: 2;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    padding: 15px;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
    user-select: none;
}

.ui-visible .description-content {
    opacity: 1;
}

/* Controls Styles */
.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 25px; /* KEY PARAMETER: Space between navigation and action buttons */
    margin-top: 5px;
}

/* Viewpoint Navigation */
.viewpoint-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px; /* KEY PARAMETER: Space between nav buttons and indicators */
    width: 100%;
}

.nav-button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 50%;
    width: 48px; /* KEY PARAMETER: Size of navigation buttons */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
}

.nav-button svg {
    width: 24px;
    height: 24px;
    color: #fff;
}

.nav-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

/* Viewpoint Indicators */
.viewpoint-indicators {
    display: flex;
    gap: 12px; /* KEY PARAMETER: Space between indicator dots */
    user-select: none;
}

.viewpoint-dot {
    width: 12px; /* KEY PARAMETER: Size of indicator dots */
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
}

.viewpoint-dot:hover {
    background: rgba(255, 255, 255, 0.5);
}

.viewpoint-dot.active {
    background: #fff;
    transform: scale(1.2);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 15px; /* KEY PARAMETER: Space between action buttons */
}

.action-button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 50%;
    width: 48px; /* KEY PARAMETER: Size of action buttons */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
}

.action-button svg {
    width: 24px;
    height: 24px;
    color: #fff;
}

.action-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

.action-button.active {
    background: rgba(255, 255, 255, 0.3);
}

#btn-auto-rotate.active {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

#btn-auto-rotate.active svg {
    animation: gentle-rotate 10s linear infinite;
}

#btn-auto-rotate.pressed,
#btn-hide-ui.pressed {
    transform: scale(1.2);
    transition: transform 0.2s ease;
}

/* Loader and Overlay Styles */
#custom-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: opacity 0.8s ease;
}

.loader-logo {
    height: 80px;
    margin-bottom: 30px;
    animation: pulse 2s infinite;
}

.loader-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top: 4px solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

#fade-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    z-index: 5;
    opacity: 1;
    transition: opacity 1.5s ease;
    pointer-events: none;
}

/* UI Hidden State */
.ui-hidden .ui-overlay,
.ui-hidden .logo-container {
    opacity: 0 !important;
    pointer-events: none !important;
}

.ui-hidden .nav-button,
.ui-hidden .action-button,
.ui-hidden .viewpoint-dot,
.ui-hidden .logo {
    pointer-events: none !important;
}

/* Notification Styles */
#ui-hidden-notification {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 0.95rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease;
    text-align: center; /* Add this line to ensure center alignment */
    width: auto;
    max-width: 80%; /* Ensure it doesn't get too wide on larger screens */
}

/* Focus Styles - For Accessibility */
button:focus {
    outline: none;
}

button:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
    outline: none;
}

:focus:not(:focus-visible) {
    outline: none;
}

.nav-button:focus-visible,
.action-button:focus-visible,
.viewpoint-dot:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
}

/* Animations */
@keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes gentle-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
    .centered-content {
        gap: 15px; /* Adjust spacing for medium screens */
        padding: 15px;
    }
    
    .content-section {
        gap: 35px;
    }
    
    .controls {
        gap: 20px;
    }
    
    .title-bar h1 {
        font-size: 2.5rem;
    }
    
    .logo {
        height: 120px;
    }
    
    .nav-button,
    .action-button {
        width: 40px;
        height: 40px;
    }
    
    .nav-button svg,
    .action-button svg {
        width: 20px;
        height: 20px;
    }
    
    .viewpoint-dot {
        width: 10px;
        height: 10px;
    }
}

@media (max-width: 480px) {
    .centered-content {
        gap: 10px; /* Adjust spacing for small screens */
        padding: 10px;
    }
    
    .content-section {
        gap: 25px;
    }
    
    .controls {
        gap: 15px;
    }
    
    .title-bar h1 {
        font-size: 2rem;
    }
    
    .logo {
        height: 90px;
    }
    
    .description-content {
        font-size: 0.9rem;
        padding: 10px;
    }
    
    .viewpoint-navigation {
        gap: 10px;
    }
    
    .nav-button,
    .action-button {
        width: 36px;
        height: 36px;
    }
    
    .viewpoint-dot {
        width: 8px;
        height: 8px;
    }
    
    .action-buttons {
        gap: 10px;
    }
}

/* Mobile viewport height fix */
:root {
    --vh: 1vh;
  }
  
  @media (max-width: 768px) {
    /* Adjust main container height for mobile */
    .main-container {
      height: calc(var(--vh, 1vh) * 100);
    }
    
    /* Center the UI overlay better for mobile */
    .ui-overlay {
      height: calc(var(--vh, 1vh) * 100);
      align-items: center;
      justify-content: center;
    }
    
    /* Adjust centered content position for mobile */
    .centered-content {
      position: relative;
      top: -10%; /* Move content up slightly to counteract Chrome's behavior */
      transform: translateY(0);
    }
  }

/* Back button styles */
.back-button {
    position: absolute;
    top: 20px;
    left: 20px;  /* Changed from 'right' to 'left' */
    z-index: 15;
    transition: opacity 0.5s ease;
    pointer-events: auto;
}

#btn-back {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 50%;
    width: 40px;  /* Reduced from 48px */
    height: 40px;  /* Reduced from 48px */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

#btn-back svg {
    width: 20px;  /* Reduced from 24px */
    height: 20px;  /* Reduced from 24px */
    color: #fff;
}

#btn-back:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

/* Include back button in UI visibility control */
.ui-hidden .back-button {
    opacity: 0 !important;
    pointer-events: none !important;
}

</style>

</head>
<body>
    <!-- Custom loader -->
    <div id="custom-loader">
        <img src="https://assets.360.petsq.works/vanthof/Van-t-Hof_logo-1024x1024.png" alt="Van 't Hof Logo" class="loader-logo">
        <div class="loader-spinner"></div>
    </div>
    
    <!-- Black fade overlay -->
    <div id="fade-overlay"></div>
    
    <!-- Main container -->
    <div class="main-container">

        <!-- Back button -->
<div class="back-button">
    <button id="btn-back" aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
    </button>
</div>

        <!-- Video container - will be replaced by Three.js -->
        <div id="video-container"></div>
        
        <!-- UI Overlay -->
        <div class="ui-overlay">
            <!-- Centered Content Container -->
            <div class="centered-content">
                <!-- Logo -->
                <div class="logo-container">
                    <a href="https://vanthoffoodgroup.com">
                        <img src="https://assets.360.petsq.works/vanthof/Van-t-Hof_logo-1024x1024.png" alt="Van 't Hof Logo" class="logo">
                    </a>
                </div>
                
                <!-- Content Section (Title and Description) -->
                <div class="content-section">
                    <!-- Title Bar -->
                    <div class="title-bar">
                        <h1 id="viewpoint-title">Production Journey</h1>
                    </div>
                    
                    <!-- Description -->
                    <div class="description-container">
                        <div class="description-blur"></div>
                        <div class="description-content">
                            <p id="description-text">Experience the intricate process of Van 't Hof's precision food production. From raw ingredient preparation to final packaging, our 360° tour reveals the meticulous craftsmanship behind every product.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="controls">
                    <div class="viewpoint-navigation">
                        <button id="prev-viewpoint" class="nav-button" aria-label="Previous viewpoint">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        
                        <div class="viewpoint-indicators">
                            <span class="viewpoint-dot active" data-index="0"></span>
                            <span class="viewpoint-dot" data-index="1"></span>
                            <span class="viewpoint-dot" data-index="2"></span>
                            <span class="viewpoint-dot" data-index="3"></span>
                            <span class="viewpoint-dot" data-index="4"></span>
                        </div>
                        
                        <button id="next-viewpoint" class="nav-button" aria-label="Next viewpoint">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="btn-auto-rotate" class="action-button" aria-label="Auto-rotate">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                            </svg>
                        </button>
                        <button id="btn-hide-ui" class="action-button" aria-label="Hide UI">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Hidden UI notification -->
        <div id="ui-hidden-notification">Double-tap to show controls</div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js"></script>
    
<script>

/**
 * Configuration and data for the 360° experience
 */

// Viewpoint configuration
const CONFIG = {
    // Animation and transition timing
    transitions: {
        fadeInDuration: 500,  // ms
        fadeOutDuration: 500, // ms
        loaderHideDuration: 500 // ms
    },
    
    // UI options
    ui: {
        autoHideTimeout: 3000, // ms
        doubleTapTimeout: 300  // ms for detecting double tap/click
    },
    
    // Camera settings
    camera: {
        initialPosition: { x: 100, y: 20, z: 0 },
        fov: 75,
        near: 1,
        far: 1000,
        minDistance: 5,
        maxDistance: 300,
        rotateSpeed: 0.5,
        autoRotateSpeed: 0.5
    }
};

// Viewpoint data
const VIEWPOINTS = [
    {
        id: 0,
        title: "Processing",
        videoUrl: "https://vanthoffoodgroup.com/wp-content/uploads/2025/03/vth2_edit.mp4",
        description: "Advanced processing transforms raw ingredients into premium food products using state-of-the-art machinery."
    },
    {
        id: 1,
        title: "Frying",
        videoUrl: "https://vanthoffoodgroup.com/wp-content/uploads/2025/03/vth3_edit.mp4",
        description: "Through the frying process with our frying line, we ensure that any bacteria present are killed."
    },
    {
        id: 2,
        title: "Freezing",
        videoUrl: "https://vanthoffoodgroup.com/wp-content/uploads/2025/03/vth4_edit.mp4",
        description: "Immediately after frying, the spring rolls are cooled down in a spiral freezer. Unfortunately, it is too cold to make a video in the freezer."
    },
    {
        id: 3,
        title: "Packaging",
        videoUrl: "https://vanthoffoodgroup.com/wp-content/uploads/2025/03/vth5_edit.mp4",
        description: "Our springrolls are packaged with two rolls per retail unit. These are then organized into carton delivery boxes or crates."
    },
    {
        id: 4,
        title: "Labeling",
        videoUrl: "https://vanthoffoodgroup.com/wp-content/uploads/2025/03/vth6_edit.mp4",
        description: "We provide white-label solutions, delivering products that are retail-ready while maintaining food safety standards throughout the entire process."
    }
];

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

/**
 * Three.js scene management
 */

 class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.videoMesh = null;
        this.isInitialized = false;
        this.animationFrameId = null;
        this.container = null;
    }
    
    /**
     * Initialize the 3D scene
     */
    init() {
        // Find container
        this.container = UTILS.dom.getElement('video-container');
        if (!this.container) {
            UTILS.errors.showUserError('Could not find video container');
            return false;
        }
        
        try {
            this.createScene();
            this.createCamera();
            this.createRenderer();
            this.createControls();
            this.setupResizeHandler();
            this.startAnimationLoop();
            this.isInitialized = true;
            return true;
        } catch (error) {
            UTILS.errors.logError(error, 'Scene initialization failed');
            UTILS.errors.showUserError('Failed to initialize 3D viewer');
            return false;
        }
    }
    
    /**
     * Create the Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
    }
    
    /**
     * Create the camera
     */
    createCamera() {
        const { fov, near, far } = CONFIG.camera;
        this.camera = new THREE.PerspectiveCamera(
            fov, 
            window.innerWidth / window.innerHeight, 
            near, 
            far
        );
        
        // Set initial position
        const { x, y, z } = CONFIG.camera.initialPosition;
        this.camera.position.set(x, y, z);
    }
    
    /**
     * Create the WebGL renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Create orbit controls
     */
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        // Apply settings from config
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = CONFIG.camera.rotateSpeed;
        this.controls.zoomSpeed = 1;
        this.controls.minDistance = CONFIG.camera.minDistance;
        this.controls.maxDistance = CONFIG.camera.maxDistance;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = CONFIG.camera.autoRotateSpeed;
    }
    
    /**
     * Handle window resizing
     */
    setupResizeHandler() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Resize handler
     */
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Start animation loop
     */
    startAnimationLoop() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            
            if (this.controls) {
                this.controls.update();
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }
    
    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Create a video sphere from a video element
     */
    createVideoSphere(videoElement, videoTexture) {
        // Remove existing sphere if present
        this.removeVideoSphere();
        
        try {
            // Create sphere geometry
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1); // Invert to show inner surface
            
            // Create material with video texture
            const material = new THREE.MeshBasicMaterial({ map: videoTexture });
            
            // Create mesh and add to scene
            this.videoMesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.videoMesh);
            
            return true;
        } catch (error) {
            UTILS.errors.logError(error, 'Failed to create video sphere');
            return false;
        }
    }
    
    /**
     * Remove and dispose the video sphere
     */
    removeVideoSphere() {
        if (this.videoMesh) {
            this.scene.remove(this.videoMesh);
            UTILS.resources.disposeThreeJSObject(this.videoMesh);
            this.videoMesh = null;
        }
    }
    
    /**
     * Reset camera position
     */
    resetCameraPosition() {
        if (!this.camera || !this.controls) return;
        
        // Save auto-rotation state
        const wasAutoRotating = this.controls.autoRotate;
        
        // Temporarily disable auto-rotation
        this.controls.autoRotate = false;
        
        // Reset position
        const { x, y, z } = CONFIG.camera.initialPosition;
        this.camera.position.set(x, y, z);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Restore auto-rotation
        this.controls.autoRotate = wasAutoRotating;
    }
    
    /**
     * Toggle auto-rotation
     */
    toggleAutoRotate() {
        if (!this.controls) return false;
        
        this.controls.autoRotate = !this.controls.autoRotate;
        return this.controls.autoRotate;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopAnimationLoop();
        this.removeVideoSphere();
        
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
            this.renderer = null;
        }
        
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        this.scene = null;
        this.camera = null;
        this.isInitialized = false;
    }
}

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

        // Show back button
const backButton = document.querySelector('.back-button');
if (backButton) {
    backButton.style.opacity = '1';
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

        // Hide back button
const backButton = document.querySelector('.back-button');
if (backButton) {
    backButton.style.opacity = '0';
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

/**
 * Utility functions and device detection
 */

 const UTILS = {
    // Device detection
    device: {
        isIOSDevice: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        isIOSChrome: /iPhone|iPad|iPod/i.test(navigator.userAgent) && /CriOS/i.test(navigator.userAgent),
        isIOSSafari: /iPhone|iPad|iPod/i.test(navigator.userAgent) && /Version\//.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        
        get isAnyiOS() {
            return this.isIOSDevice;
        }
    },
    
    // DOM helpers
    dom: {
        /**
         * Get element by ID with error handling
         */
        getElement(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found`);
            }
            return element;
        },
        
        /**
         * Get elements by selector with error handling
         */
        getElements(selector) {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                console.warn(`No elements found with selector '${selector}'`);
            }
            return elements;
        }
    },
    
    // Resource management
    resources: {
        /**
         * Safely dispose Three.js resources
         */
        disposeThreeJSObject(obj) {
            if (!obj) return;
            
            // Dispose geometry
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            
            // Dispose material(s)
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    });
                } else {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            }
            
            // Handle children recursively
            if (obj.children && obj.children.length > 0) {
                for (let i = obj.children.length - 1; i >= 0; i--) {
                    this.disposeThreeJSObject(obj.children[i]);
                }
            }
        },
        
        /**
         * Clean up video element
         */
        cleanupVideo(videoElement) {
            if (!videoElement) return;
            
            try {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
                if (videoElement.parentNode) {
                    videoElement.parentNode.removeChild(videoElement);
                }
            } catch (error) {
                console.error('Error cleaning up video element:', error);
            }
        }
    },
    
    // Error handling
    errors: {
        /**
         * Show error message to user
         */
        showUserError(message) {
            const loader = document.getElementById('custom-loader');
            if (loader) {
                loader.innerHTML = `
                    <div style="color: white; padding: 20px; text-align: center;">
                        <h2>Error Loading 360° Experience</h2>
                        <p>${message}</p>
                        <button onclick="location.reload()" 
                            style="background: rgba(255,255,255,0.2); border: none; color: white; 
                            padding: 10px 20px; margin-top: 20px; border-radius: 4px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                `;
                loader.style.opacity = '1';
                loader.style.display = 'flex';
            } else {
                console.error('Error:', message);
                alert(`Error: ${message}\n\nPlease refresh the page.`);
            }
        },
        
        /**
         * Log error with additional context
         */
        logError(error, context = '') {
            console.error(`[Van't Hof 360°]${context ? ' ' + context : ''}:`, error);
        }
    }
};

/**
 * Video management and loading
 */

 class VideoManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.videoElement = null;
        this.videoTexture = null;
        this.isPlaying = false;
        this.currentVideoUrl = '';
        this.videoCache = {}; // Cache for preloaded videos
        this.maxCacheSize = 3; // Maximum number of videos to keep in cache
    }
    
    /**
     * Load a video by URL
     */
    /**
 * Load a video by URL
 */
async loadVideo(videoUrl) {
    // Don't reload the same video
    if (videoUrl === this.currentVideoUrl && this.isPlaying) {
        return true;
    }
    
    try {
        this.currentVideoUrl = videoUrl;
        
        // Special handling for iOS devices
        if (UTILS.device.isAnyiOS) {
            return await this.loadVideoForIOS(videoUrl);
        }
        
        // Standard browser handling
        return await this.loadVideoForStandard(videoUrl);
    } catch (error) {
        UTILS.errors.logError(error, `Failed to load video: ${videoUrl}`);
        return false;
    }
}

/**
 * Load video specifically for iOS devices
 */
async loadVideoForIOS(videoUrl) {
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.style.display = 'none';
    videoElement.setAttribute('loop', '');
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    try {
        // Wait for video to load
        await new Promise((resolve, reject) => {
            const loadHandler = () => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                resolve();
            };
            
            const errorHandler = (e) => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                reject(new Error('Video load error: ' + (e.message || 'Unknown error')));
            };
            
            videoElement.addEventListener('loadeddata', loadHandler);
            videoElement.addEventListener('error', errorHandler);
            
            videoElement.load();
        });
        
        // Set current video
        this.videoElement = videoElement;
        
        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        
        // Create video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Play video safely
        await this.videoElement.play().catch(e => {
            console.warn('Auto-play prevented on iOS, waiting for user interaction:', e);
            this.setupPlayOnInteraction();
        });
        
        this.isPlaying = true;
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'iOS video load error');
        return false;
    }
}

/**
 * Load video for standard browsers
 */
async loadVideoForStandard(videoUrl) {
    // Use cache if available
    if (this.videoCache[videoUrl]) {
        this.useVideoFromCache(videoUrl);
        return true;
    }
    
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    try {
        // Wait for video to load
        await this.waitForVideoLoad(videoElement);
        
        // Set current video
        this.videoElement = videoElement;
        
        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        
        // Create video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Add to cache
        this.addToCache(this.currentVideoUrl, this.videoElement, this.videoTexture);
        
        // Start playback
        await this.play();
        
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'Standard video load error');
        return false;
    }
}
    
    /**
     * Use a video from the cache
     */
    useVideoFromCache(videoUrl) {
        const cachedVideo = this.videoCache[videoUrl];
        
        // Clean up current video
        this.cleanupCurrentVideo();
        
        // Use the cached video
        this.videoElement = cachedVideo.element;
        this.videoTexture = cachedVideo.texture;
        
        // Create new video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Start playback
        this.play();
    }
    
    /**
     * Create a video element
     */
/**
 * Create a video element
 */
createVideoElement(videoUrl) {
    // Clean up any existing video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true; // Ensure loop is set to true
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // Add iOS-specific attributes
    if (UTILS.device.isAnyiOS) {
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
    }
    
    // Hide video element
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    return videoElement;
}
    
    /**
     * Wait for video to load
     */
    waitForVideoLoad(videoElement) {
        return new Promise((resolve, reject) => {
            // Set up load event
            const loadHandler = () => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                resolve();
            };
            
            // Set up error event
            const errorHandler = (event) => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                reject(new Error(`Video load error: ${event.message || 'Unknown error'}`));
            };
            
            // Add event listeners
            videoElement.addEventListener('loadeddata', loadHandler);
            videoElement.addEventListener('error', errorHandler);
            
            // Start loading
            videoElement.load();
            
            // Add timeout for error handling
            setTimeout(() => {
                // If still waiting, trigger error
                if (videoElement.readyState < 2) {
                    errorHandler({ message: 'Video load timeout' });
                }
            }, 20000); // 20 second timeout
        });
    }
    
    /**
     * Set up video after loading
     */
/**
 * Set up video after loading
 */
setupVideo(videoElement) {
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Set current video
    this.videoElement = videoElement;
    
    // Ensure loop is set
    this.videoElement.loop = true;
    this.videoElement.setAttribute('loop', '');
    
    // Add ended event listener as a backup
    this.videoElement.addEventListener('ended', () => {
        console.log('Video ended, restarting...');
        this.videoElement.currentTime = 0;
        this.videoElement.play().catch(e => console.error('Error restarting video:', e));
    });
    
    // Create video texture
    this.videoTexture = new THREE.VideoTexture(this.videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    
    // Create video sphere
    this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
    
    // Add to cache
    this.addToCache(this.currentVideoUrl, this.videoElement, this.videoTexture);
    
    // Start playback
    this.play();
}
    
    /**
     * Add video to cache
     */
    addToCache(url, element, texture) {
        // Check if we need to remove items from cache
        const cacheKeys = Object.keys(this.videoCache);
        if (cacheKeys.length >= this.maxCacheSize) {
            // Find the least recently used video that's not the current one
            const oldestKey = cacheKeys.find(key => key !== this.currentVideoUrl);
            if (oldestKey) {
                this.removeCacheItem(oldestKey);
            }
        }
        
        // Add to cache
        this.videoCache[url] = {
            element: element,
            texture: texture,
            lastUsed: Date.now()
        };
    }
    
    /**
     * Remove item from cache
     */
    removeCacheItem(url) {
        if (this.videoCache[url]) {
            // Don't remove the current video
            if (url === this.currentVideoUrl) return;
            
            const cachedItem = this.videoCache[url];
            
            // Clean up resources
            if (cachedItem.element !== this.videoElement) {
                UTILS.resources.cleanupVideo(cachedItem.element);
            }
            
            delete this.videoCache[url];
        }
    }
    
    /**
     * Play current video
     */
/**
 * Play current video
 */
async play() {
    if (!this.videoElement) return false;
    
    try {
        // Ensure loop is set before playing
        this.videoElement.loop = true;
        
        await this.videoElement.play();
        this.isPlaying = true;
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'Video play error');
        
        // Try to play on user interaction for Safari/iOS
        this.setupPlayOnInteraction();
        
        return false;
    }
}
    
    /**
     * Set up play-on-interaction handlers for browsers that block autoplay
     */
    setupPlayOnInteraction() {
        const playVideo = () => {
            if (this.videoElement) {
                this.videoElement.play()
                    .then(() => {
                        this.isPlaying = true;
                    })
                    .catch(error => {
                        UTILS.errors.logError(error, 'Play on interaction failed');
                    });
            }
            
            // Remove event listeners
            document.removeEventListener('click', playVideo);
            document.removeEventListener('touchstart', playVideo);
        };
        
        // Add one-time event listeners
        document.addEventListener('click', playVideo, { once: true });
        document.addEventListener('touchstart', playVideo, { once: true });
    }
    
    /**
     * Clean up current video
     */
    cleanupCurrentVideo() {
        // Don't remove from cache, just cleanup references
        if (this.videoElement) {
            // Only pause if this is not a cached video
            if (!Object.values(this.videoCache).some(item => item.element === this.videoElement)) {
                UTILS.resources.cleanupVideo(this.videoElement);
            } else {
                // Just pause it if it's cached
                this.videoElement.pause();
            }
        }
        
        this.videoElement = null;
        this.videoTexture = null;
        this.isPlaying = false;
    }
    
    /**
     * Preload a video
     */
    preloadVideo(videoUrl) {
        // Don't preload if already in cache
        if (this.videoCache[videoUrl]) return;
        
        // Create preload video element
        const preloadVideo = document.createElement('video');
        preloadVideo.crossOrigin = 'anonymous';
        preloadVideo.muted = true;
        preloadVideo.preload = 'auto';
        preloadVideo.style.display = 'none';
        preloadVideo.src = videoUrl;
        document.body.appendChild(preloadVideo);
        
        // Listen for load event
        preloadVideo.addEventListener('loadeddata', () => {
            // Create texture
            const texture = new THREE.VideoTexture(preloadVideo);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Add to cache
            this.addToCache(videoUrl, preloadVideo, texture);
        });
        
        // Handle load error
        preloadVideo.addEventListener('error', () => {
            UTILS.resources.cleanupVideo(preloadVideo);
        });
        
        // Start loading
        preloadVideo.load();
    }
    
    /**
     * Update video texture
     */
    updateTexture() {
        if (this.videoTexture && this.videoElement && this.videoElement.readyState >= 2) {
            this.videoTexture.needsUpdate = true;
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Clean up current video
        this.cleanupCurrentVideo();
        
        // Clean up cache
        Object.keys(this.videoCache).forEach(url => {
            this.removeCacheItem(url);
        });
        
        this.videoCache = {};
    }
}

// Back button
const backButton = UTILS.dom.getElement('btn-back');
if (backButton) {
    backButton.addEventListener('click', () => {
        window.history.back();
    });
}

</script>

</body>
</html>
<?php exit; // Stop WordPress from loading anything else ?>