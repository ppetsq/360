/**
 * Van 't Hof Production Line 360° Experience
 * Mobile-friendly implementation using Three.js for 360° video
 */

// Define viewpoints with metadata
const viewpoints = [
    {
        id: 0,
        title: "Preparation",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth1_edit.mp4",
        description: "The journey begins in our meticulously organized preparation area. Here, raw ingredients are carefully selected, inspected, and prepared for processing. Our team ensures only the highest quality materials make it to the next stage."
    },
    {
        id: 1,
        title: "Processing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth2_edit.mp4",
        description: "Advanced processing transforms raw ingredients into premium food products. Our state-of-the-art machinery precisely cuts, mixes, and transforms ingredients while maintaining optimal temperature and quality standards."
    },
    {
        id: 2,
        title: "Quality Control",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth3_edit.mp4",
        description: "Rigorous quality control is the heart of our production. Each batch undergoes comprehensive testing, from visual inspections to advanced chemical and microbiological analyses, ensuring every product meets our exceptional standards."
    },
    {
        id: 3,
        title: "Packaging",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth4_edit.mp4",
        description: "Precision packaging preserves the integrity of our products. Automated systems carefully seal and package each item, protecting freshness and quality while minimizing environmental impact through sustainable packaging solutions."
    },
    {
        id: 4,
        title: "Storage",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth5_edit.mp4",
        description: "Our advanced storage facilities maintain optimal conditions for product preservation. Carefully controlled temperature, humidity, and lighting ensure that every product remains in perfect condition from production to delivery."
    },
    {
        id: 5,
        title: "Shipping",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth6_edit.mp4",
        description: "The final stage of our production journey. Products are carefully loaded and dispatched using our sophisticated logistics network, ensuring timely and precise delivery to customers while maintaining the highest standards of food safety."
    }
];

// Global state variables
let currentViewpointIndex = 0;
let isAutoRotating = false;
let isUIHidden = false;
let lastTapTime = 0;
let hasShownUIHiddenNotice = false;
let isTransitioning = false;
let hasUserInteracted = false;

// Three.js variables
let scene, camera, renderer;
let controls;
let animationId = null;

// Video elements and textures
let mainVideoElement = null;
let videoTexture = null;
let mesh = null;

// Initialize video sources
const videoSources = {};

/**
 * Initialize the experience
 */
function init() {
    // Create main video element that will be reused
    createMainVideoElement();
    
    // Show loader
    showLoader();
    
    // Set up Three.js scene
    setupThreeJS();
    
    // Create the sphere
    createSphere();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load the first video
    loadVideo(viewpoints[currentViewpointIndex].videoUrl);
    
    // Update viewpoint info in UI
    updateViewpointInfo();
    
    // Initialize blur overlay
    document.body.classList.add('ui-visible');
}

/**
 * Create a main video element that will be reused for all videos
 */
function createMainVideoElement() {
    mainVideoElement = document.createElement('video');
    mainVideoElement.setAttribute('crossorigin', 'anonymous');
    mainVideoElement.setAttribute('webkit-playsinline', '');
    mainVideoElement.setAttribute('playsinline', '');
    mainVideoElement.setAttribute('muted', '');
    mainVideoElement.muted = true; // Double-ensure muting
    mainVideoElement.loop = true;
    mainVideoElement.preload = "auto";
    
    // Important for iOS - hide the video element
    mainVideoElement.style.width = '1px';
    mainVideoElement.style.height = '1px';
    mainVideoElement.style.position = 'absolute';
    mainVideoElement.style.top = '-1px';
    mainVideoElement.style.left = '-1px';
    mainVideoElement.style.opacity = '0.01';
    mainVideoElement.style.pointerEvents = 'none';
    mainVideoElement.style.zIndex = '-1000';
    
    // Add to DOM (important for mobile)
    document.body.appendChild(mainVideoElement);
}

/**
 * Set up the Three.js environment
 */
function setupThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera with default settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 0.1); // Small offset to prevent bugs
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    
    // Add renderer to DOM
    const container = document.getElementById('video-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // Set up OrbitControls - improved for mobile
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false; // Disable panning for better mobile experience
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7; // Reduced for smoother mobile zoom
    controls.minDistance = 0.1; // Allow close zoom but not at center
    controls.maxDistance = 180; // Limit to prevent seeing outside sphere
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.1;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add a background color to the scene
    scene.background = new THREE.Color(0x000000);
    
    // Start animation loop
    animate();
}

/**
 * Create the 360° sphere
 */
function createSphere() {
    // Create sphere geometry (inside-out)
    const geometry = new THREE.SphereGeometry(100, 64, 32); // Larger radius, higher detail
    geometry.scale(-1, 1, 1); // Invert sphere for interior view
    
    // Create a video texture (will be updated later)
    videoTexture = new THREE.VideoTexture(mainVideoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    
    // Create basic material with video texture
    const material = new THREE.MeshBasicMaterial({
        map: videoTexture
    });
    
    // Create mesh and add to scene
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * Animation loop
 */
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

/**
 * Load a video and update the texture
 */
function loadVideo(videoUrl) {
    console.log("Loading video:", videoUrl);
    showLoader();
    
    // Set source
    mainVideoElement.src = videoUrl;
    
    // Reset video
    mainVideoElement.currentTime = 0;
    
    // Force texture update
    videoTexture.needsUpdate = true;
    
    // Load and play when ready
    const loadPromise = new Promise((resolve, reject) => {
        const loadedHandler = () => {
            mainVideoElement.removeEventListener('loadeddata', loadedHandler);
            mainVideoElement.removeEventListener('error', errorHandler);
            resolve();
        };
        
        const errorHandler = (error) => {
            mainVideoElement.removeEventListener('loadeddata', loadedHandler);
            mainVideoElement.removeEventListener('error', errorHandler);
            reject(error);
        };
        
        mainVideoElement.addEventListener('loadeddata', loadedHandler);
        mainVideoElement.addEventListener('error', errorHandler);
    });
    
    // Load the video
    mainVideoElement.load();
    
    return loadPromise
        .then(() => {
            console.log("Video loaded successfully");
            return playVideo();
        })
        .catch(error => {
            console.error("Error loading video:", error);
            hideLoader();
            showErrorMessage(`Error loading video: ${videoUrl}`);
            return Promise.reject(error);
        });
}

/**
 * Play the video with mobile detection
 */
function playVideo() {
    console.log("Attempting to play video");
    
    // Try to play
    const playPromise = mainVideoElement.play();
    
    if (playPromise !== undefined) {
        return playPromise
            .then(() => {
                console.log("Video playing");
                hideLoader();
                return Promise.resolve();
            })
            .catch(error => {
                console.warn("Autoplay prevented:", error);
                
                // Only show interaction message for first play
                if (!hasUserInteracted) {
                    showPlayButton();
                }
                
                return Promise.reject(error);
            });
    } else {
        // For old browsers without promises
        hideLoader();
        return Promise.resolve();
    }
}

/**
 * Show a play button for mobile
 */
function showPlayButton() {
    // Create the play button container
    const playButton = document.createElement('div');
    playButton.id = 'mobile-play-button';
    playButton.style.position = 'fixed';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.background = 'rgba(0,0,0,0.7)';
    playButton.style.color = 'white';
    playButton.style.borderRadius = '10px';
    playButton.style.padding = '20px 40px';
    playButton.style.textAlign = 'center';
    playButton.style.cursor = 'pointer';
    playButton.style.zIndex = '10000';
    playButton.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 10px;">Tap to Start Experience</div>
        <div style="font-size: 40px;">▶️</div>
    `;
    
    // Add to body
    document.body.appendChild(playButton);
    
    // Add click handler
    playButton.addEventListener('click', function onPlayButtonClick() {
        // Try to play again
        mainVideoElement.play()
            .then(() => {
                console.log("Video started after user interaction");
                hasUserInteracted = true;
                hideLoader();
                
                // Remove play button
                if (document.body.contains(playButton)) {
                    document.body.removeChild(playButton);
                }
            })
            .catch(err => {
                console.error("Still can't play after interaction:", err);
                
                // Keep the button visible
                playButton.innerHTML = `
                    <div style="font-size: 18px; margin-bottom: 10px;">Tap Again</div>
                    <div style="font-size: 40px;">▶️</div>
                `;
            });
    });
}

/**
 * Set up event listeners for user interaction
 */
function setupEventListeners() {
    // Navigation buttons
    const prevButton = document.getElementById('prev-viewpoint');
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            goToPreviousViewpoint();
        });
    }
    
    const nextButton = document.getElementById('next-viewpoint');
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            goToNextViewpoint();
        });
    }
    
    // Viewpoint indicator dots
    const dots = document.querySelectorAll('.viewpoint-dot');
    for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', function(e) {
            e.stopPropagation();
            changeViewpoint(parseInt(this.dataset.index));
        });
    }
    
    // Auto rotate button
    const autoRotateButton = document.getElementById('btn-auto-rotate');
    if (autoRotateButton) {
        autoRotateButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAutoRotate();
        });
    }
    
    // Hide UI button
    const hideUIButton = document.getElementById('btn-hide-ui');
    if (hideUIButton) {
        hideUIButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUI();
        });
    }
    
    // Double tap for mobile
    document.addEventListener('touchstart', handleDoubleTap, { passive: false });
    
    // Double click for desktop
    let lastClickTime = 0;
    document.addEventListener('click', function(event) {
        const currentTime = new Date().getTime();
        const clickLength = currentTime - lastClickTime;
        
        // Detect double click (within 300ms)
        if (clickLength < 300 && clickLength > 0) {
            // Only toggle UI for clicks on the canvas, not UI elements
            const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo, a');
            
            if (!isOnUIElement) {
                toggleUI();
                event.preventDefault();
            }
        }
        
        lastClickTime = currentTime;
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Prevent default mobile touch behaviors on canvas
    renderer.domElement.addEventListener('touchstart', e => {
        e.preventDefault();
    }, { passive: false });
    
    renderer.domElement.addEventListener('touchmove', e => {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent mobile context menu on long press
    renderer.domElement.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
}

/**
 * Handle double tap events on mobile
 */
function handleDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    // Detect double tap (within 300ms)
    if (tapLength < 300 && tapLength > 0) {
        // Only toggle UI for taps on the canvas, not UI elements
        const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo, a');
        
        if (!isOnUIElement) {
            toggleUI();
            event.preventDefault();
            event.stopPropagation();
        }
    }
    
    lastTapTime = currentTime;
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    switch(event.key) {
        case 'ArrowLeft':
            goToPreviousViewpoint();
            break;
        case 'ArrowRight':
            goToNextViewpoint();
            break;
        case 'r':
        case 'R':
            toggleAutoRotate();
            break;
        case 'h':
        case 'H':
        case 'Escape':
            if (isUIHidden) {
                toggleUI();
            }
            break;
    }
}

/**
 * Toggle UI visibility
 */
function toggleUI() {
    // Toggle UI visibility state
    isUIHidden = !isUIHidden;
    
    if (isUIHidden) {
        // Hide UI
        document.body.classList.remove('ui-visible');
        document.body.classList.add('ui-hidden');
        
        // Show notification if we haven't before
        if (!hasShownUIHiddenNotice) {
            const notification = document.getElementById('ui-hidden-notification');
            if (notification) {
                notification.style.opacity = '1';
                setTimeout(() => { notification.style.opacity = '0'; }, 3000);
                hasShownUIHiddenNotice = true;
            }
        }
    } else {
        // Show UI
        document.body.classList.remove('ui-hidden');
        document.body.classList.add('ui-visible');
    }
}

/**
 * Toggle auto-rotation
 */
function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    
    if (controls) {
        controls.autoRotate = isAutoRotating;
    }
    
    const autoRotateButton = document.getElementById('btn-auto-rotate');
    if (autoRotateButton) {
        autoRotateButton.classList.toggle('active', isAutoRotating);
    }
}

/**
 * Navigate to previous viewpoint
 */
function goToPreviousViewpoint() {
    let newIndex = currentViewpointIndex - 1;
    if (newIndex < 0) {
        newIndex = viewpoints.length - 1;
    }
    changeViewpoint(newIndex);
}

/**
 * Navigate to next viewpoint
 */
function goToNextViewpoint() {
    let newIndex = currentViewpointIndex + 1;
    if (newIndex >= viewpoints.length) {
        newIndex = 0;
    }
    changeViewpoint(newIndex);
}

/**
 * Change to a specific viewpoint
 */
function changeViewpoint(index) {
    // Prevent changing to current viewpoint or during transition
    if (index === currentViewpointIndex || isTransitioning) return;
    
    // Set transitioning state
    isTransitioning = true;
    
    // Immediately update UI for better perceived responsiveness
    currentViewpointIndex = index;
    updateViewpointInfo();
    
    // Fade to black - consistent transition
    const fadeOverlay = document.getElementById('fade-overlay');
    if (fadeOverlay) {
        fadeOverlay.style.opacity = '1';
    }
    
    // Wait for fade out
    setTimeout(() => {
        // Now load the new video
        loadVideo(viewpoints[currentViewpointIndex].videoUrl)
            .then(() => {
                // Fade back in
                if (fadeOverlay) {
                    fadeOverlay.style.opacity = '0';
                }
                
                // End transition state after fade completes
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            })
            .catch(() => {
                // Even on error, complete the transition
                if (fadeOverlay) {
                    fadeOverlay.style.opacity = '0';
                }
                
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            });
    }, 500);
}

/**
 * Update UI elements with current viewpoint info
 */
function updateViewpointInfo() {
    // Update title and description
    const titleElement = document.getElementById('viewpoint-title');
    const descriptionElement = document.getElementById('description-text');
    
    if (titleElement) {
        titleElement.textContent = viewpoints[currentViewpointIndex].title;
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = viewpoints[currentViewpointIndex].description;
    }
    
    // Update indicator dots
    const dots = document.querySelectorAll('.viewpoint-dot');
    for (let i = 0; i < dots.length; i++) {
        const dotIndex = parseInt(dots[i].dataset.index);
        dots[i].classList.toggle('active', dotIndex === currentViewpointIndex);
    }
}

/**
 * Show loader
 */
function showLoader() {
    const loader = document.getElementById('custom-loader');
    if (loader) loader.style.opacity = '1';
}

/**
 * Hide loader
 */
function hideLoader() {
    const loader = document.getElementById('custom-loader');
    if (loader) loader.style.opacity = '0';
    
    // Show UI elements
    setTimeout(() => {
        const uiOverlay = document.querySelector('.ui-overlay');
        const logoContainer = document.querySelector('.logo-container');
        
        if (uiOverlay && !isUIHidden) uiOverlay.style.opacity = '1';
        if (logoContainer && !isUIHidden) logoContainer.style.opacity = '1';
    }, 500);
}

/**
 * Show error message
 */
function showErrorMessage(message) {
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
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);