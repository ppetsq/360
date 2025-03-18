/**
 * Van 't Hof Production Line 360° Experience
 * Clean implementation using Three.js for 360° video
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

// Three.js variables
let scene, camera, renderer;
let videoElement, videoTexture, videoMaterial, videoMesh;
let controls;
let animationId = null;

// Cache for preloaded videos
const videoCache = {};

/**
 * Initialize the experience
 */
function init() {
    // Show loader
    showLoader();
    
    // Set up Three.js scene
    setupThreeJS();
    
    // Create first video sphere
    loadVideoSphere(viewpoints[currentViewpointIndex].videoUrl);
    
    // Set up event listeners
    setupEventListeners();
    
    // Update viewpoint info in UI
    updateViewpointInfo();
    
    // Preload next video
    preloadNextVideo();
    
    // Add zoom functionality for mobile
    setupZoomControls();
    
    // Initialize blur overlay
    document.body.classList.add('ui-visible');
}

/**
 * Set up the Three.js environment
 */
function setupThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera with default settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 150); // Default zoom level
    
    // Create renderer with anti-aliasing
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    const container = document.getElementById('video-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // Set up OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 5;
    controls.minDistance = 5;
    controls.maxDistance = 500;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
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
 * Load and display a video sphere
 * @param {string} videoUrl - URL of the 360° video
 */
function loadVideoSphere(videoUrl) {
    // Use cached video if available
    if (videoCache[videoUrl]) {
        videoElement = videoCache[videoUrl];
        createVideoSphere();
        playVideo();
    } else {
        videoElement = document.createElement('video');
        videoElement.crossOrigin = 'anonymous';
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.src = videoUrl;
        
        // Set up video when loaded
        videoElement.addEventListener('loadeddata', () => {
            videoCache[videoUrl] = videoElement;
            createVideoSphere();
            playVideo();
            hideLoader();
        });
        
        // Handle errors
        videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e);
            showErrorMessage(`Error loading video: ${videoUrl}`);
        });
        
        // Start loading
        videoElement.load();
    }
}

/**
 * Create the sphere with video texture
 */
function createVideoSphere() {
    // Clean up existing sphere if any
    if (videoMesh) {
        scene.remove(videoMesh);
        videoMaterial.dispose();
        videoTexture.dispose();
    }
    
    // Create video texture
    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert sphere for interior view
    
    // Create material with video texture
    videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    
    // Create mesh and add to scene
    videoMesh = new THREE.Mesh(geometry, videoMaterial);
    scene.add(videoMesh);
}

/**
 * Play the video with error handling
 */
function playVideo() {
    videoElement.play().catch(e => {
        console.warn('Autoplay prevented:', e);
        
        // Add one-time click handler to start video
        document.body.addEventListener('click', function bodyClick() {
            videoElement.play();
            document.body.removeEventListener('click', bodyClick);
        }, { once: true });
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
    document.addEventListener('touchstart', handleDoubleTap);
    
    // Double click for desktop
    let lastClickTime = 0;
    document.addEventListener('click', function(event) {
        const currentTime = new Date().getTime();
        const clickLength = currentTime - lastClickTime;
        
        // Detect double click (within 300ms)
        if (clickLength < 300 && clickLength > 0) {
            // Only toggle UI for clicks on the canvas, not UI elements
            const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
            
            if (!isOnUIElement) {
                toggleUI();
                event.preventDefault();
            }
        }
        
        lastClickTime = currentTime;
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
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
 * Handle double tap events on mobile
 */
function handleDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    // Detect double tap (within 300ms)
    if (tapLength < 300 && tapLength > 0) {
        // Only toggle UI for taps on the canvas, not UI elements
        const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
        
        if (!isOnUIElement) {
            toggleUI();
            event.preventDefault();
            event.stopPropagation();
        }
    }
    
    lastTapTime = currentTime;
}

/**
 * Setup pinch-to-zoom functionality for mobile
 */
function setupZoomControls() {
    const container = document.getElementById('video-container');
    if (!container) return;
    
    // Track touch events
    let initialPinchDistance = 0;
    let isPinching = false;
    
    // Detect pinch start
    container.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            isPinching = true;
        }
    });
    
    // Handle pinch zoom
    container.addEventListener('touchmove', function(e) {
        if (isPinching && e.touches.length === 2) {
            // Calculate current distance
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            // Calculate zoom factor
            const pinchRatio = currentDistance / initialPinchDistance;
            
            // Apply zoom
            if (controls) {
                if (pinchRatio > 1) {
                    controls.dollyOut(pinchRatio * 0.5);
                } else if (pinchRatio < 1) {
                    controls.dollyIn((1/pinchRatio) * 0.5);
                }
                
                controls.update();
                initialPinchDistance = currentDistance;
            }
            
            e.preventDefault();
        }
    });
    
    // Reset pinch state
    container.addEventListener('touchend', () => { isPinching = false; });
    container.addEventListener('touchcancel', () => { isPinching = false; });
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
    if (index === currentViewpointIndex) return;
    
    currentViewpointIndex = index;
    updateViewpointInfo();
    loadVideoSphere(viewpoints[currentViewpointIndex].videoUrl);
    preloadNextVideo();
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
 * Preload next video for smoother transitions
 */
function preloadNextVideo() {
    const nextIndex = (currentViewpointIndex + 1) % viewpoints.length;
    const nextUrl = viewpoints[nextIndex].videoUrl;
    
    // Skip if already preloaded
    if (videoCache[nextUrl]) return;
    
    console.log('Preloading next video:', nextUrl);
    
    // Create and configure video element
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.src = nextUrl;
    video.muted = true;
    video.loop = true;
    
    // Store in cache when loaded
    video.addEventListener('loadeddata', () => {
        videoCache[nextUrl] = video;
        console.log('Preloaded video:', nextUrl);
    });
    
    // Start loading
    video.load();
}

/**
 * Show loader
 */
function showLoader() {
    const loader = document.getElementById('custom-loader');
    if (loader) loader.style.opacity = '1';
}

/**
 * Hide loader and show UI
 */
function hideLoader() {
    const loader = document.getElementById('custom-loader');
    const fadeOverlay = document.getElementById('fade-overlay');
    
    if (loader) loader.style.opacity = '0';
    if (fadeOverlay) fadeOverlay.style.opacity = '0';
    
    // Show UI
    setTimeout(function() {
        const uiOverlay = document.querySelector('.ui-overlay');
        const logoContainer = document.querySelector('.logo-container');
        
        if (uiOverlay) uiOverlay.style.opacity = '1';
        if (logoContainer) logoContainer.style.opacity = '1';
        
        // Add class for animation
        document.body.classList.add('ui-visible');
        
        // Remove loader from DOM after fade out
        setTimeout(function() {
            if (loader) loader.style.display = 'none';
            if (fadeOverlay) fadeOverlay.style.display = 'none';
        }, 1000);
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