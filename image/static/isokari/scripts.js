// Isokari 360° Mirror Ball Experience
// Using Three.js Environment Mapping for authentic mirror ball reflection

// Global variables
let scene, camera, renderer;
let mirrorBallMesh;
let currentEnvTexture; // The currently displayed 360° environment texture
let isUserInteracting = false;
let autoRotateEnabled = true; // Auto-rotation state
let uiPanelVisible = true; // UI panel visibility state
let iconRotationAngle = 0;
let animationId = null;

// Interaction variables
let lon = 0, lat = 0;
let onPointerDownLon = 0;
let onPointerDownLat = 0;
let onPointerDownMouseX = 0;
let onPointerDownMouseY = 0;

// Zoom variables
let currentZoom = 90; // Start more zoomed in for mirror ball
const minZoom = 50; // Zoomed in
const maxZoom = 120; // Limited zoom out to prevent black background
const zoomSensitivity = 2;

// Touch zoom variables
let touchDistance = 0;
let prevTouchDistance = 0;

// Settings
const autoRotateSpeed = 0.025; // degrees per frame
const dragSensitivity = 0.25;

// Constant for stable latitude clamping (slightly adjusted for this precise fix)
const MAX_LAT_DEG = 84.5; // Clamping latitude slightly less than 90 degrees for stability with up vector manipulation
const UP_VECTOR_SMOOTHING_THRESHOLD = 75; // Start smoothing camera.up when within this many degrees of poles

// Array of image URLs
const imageUrls = [
    'https://assets.360.petsq.works/isokari/4960/01_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/02_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/03_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/04_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/05_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/06_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/07_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/08_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/09_4960.jpg',
    'https://assets.360.petsq.works/isokari/4960/10_4960.jpg'
];
let currentImageIndex = 0; // To keep track of the currently displayed image

// Initialize the experience
function init() {
    const container = document.getElementById('viewer-container');

    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(
        currentZoom,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Load the initial 360° texture
    loadEnvironmentTexture(imageUrls[currentImageIndex]);

    // Start icon rotation since auto-rotate is enabled by default
    const icon = document.getElementById('auto-rotate-icon');
    if (icon && autoRotateEnabled) {
        startIconRotation(icon);
    }

    // Setup event listeners
    setupEventListeners();
}

// Load and setup the 360° environment texture
function loadEnvironmentTexture(url) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    // Show loading overlay when a new texture starts loading
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('hidden');

    loader.load(
        url,
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.flipY = false;

            // Dispose of the old texture if it exists
            if (currentEnvTexture) {
                currentEnvTexture.dispose();
            }
            currentEnvTexture = texture;

            // Create or update mirror ball mesh with the new texture
            if (!mirrorBallMesh) {
                createMirrorBallMesh();
                scene.add(mirrorBallMesh);
            } else {
                mirrorBallMesh.material.envMap = currentEnvTexture;
                mirrorBallMesh.material.needsUpdate = true; // Important to update the material
            }

            // Hide loading overlay and show UI panel
            hideLoadingOverlayAndShowUI();

            // Only start animation loop once
            if (!renderer.isAnimating) { // A simple flag to prevent multiple animation loops
                animate();
                renderer.isAnimating = true;
            }
        },
        (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        (error) => {
            console.error('Error loading texture:', error);
            // Even on error, attempt to hide loading overlay
            hideLoadingOverlayAndShowUI();
        }
    );
}

// Create the mirror ball mesh using environment mapping (UNCHANGED from your provided script)
function createMirrorBallMesh() {
    const geometry = new THREE.SphereGeometry(8, 64, 32);
    geometry.scale(-1, -1, 1);

    const material = new THREE.MeshBasicMaterial({
        envMap: currentEnvTexture,
        reflectivity: 1.0,
        side: THREE.BackSide
    });

    mirrorBallMesh = new THREE.Mesh(geometry, material);
    mirrorBallMesh.position.set(0, 0, -2);
}

// Setup all event listeners (UNCHANGED from your provided script)
function setupEventListeners() {
    const container = document.getElementById('viewer-container');

    // Mouse events
    container.addEventListener('mousedown', onMouseDown, false);
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseUp, false);
    container.addEventListener('wheel', onMouseWheel, { passive: false });

    // Touch events
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, false);

    // Window resize
    window.addEventListener('resize', onWindowResize, false);

    // Keyboard controls
    document.addEventListener('keydown', onKeyDown, false);

    // Controls - with error checking
    const audioToggle = document.getElementById('audio-toggle');
    const autoRotateToggle = document.getElementById('auto-rotate-toggle');
    const simpleBackButton = document.getElementById('simple-back-button');
    const backButton = document.getElementById('back-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const uiToggleButton = document.getElementById('ui-toggle-button');
    const btqButton = document.getElementById('btq-button');

    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
        console.log('Audio toggle listener added');
    } else {
        console.error('Audio toggle button not found!');
    }

    if (autoRotateToggle) autoRotateToggle.addEventListener('click', toggleAutoRotate);
    if (simpleBackButton) simpleBackButton.addEventListener('click', goBack);
    if (backButton) backButton.addEventListener('click', goBack);
    if (prevButton) prevButton.addEventListener('click', goToPrevious);
    if (nextButton) nextButton.addEventListener('click', goToNext);
    if (uiToggleButton) uiToggleButton.addEventListener('click', toggleUIPanel);
    if (btqButton) btqButton.addEventListener('click', openBTQ360);
}

// Mouse interaction handlers (MODIFIED: Simplified lat clamping to avoid explicit flip logic)
function onMouseDown(event) {
    event.preventDefault();
    isUserInteracting = true;

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}

function onMouseMove(event) {
    if (isUserInteracting) {
        const deltaX = (onPointerDownMouseX - event.clientX) * dragSensitivity;
        const deltaY = (event.clientY - onPointerDownMouseY) * dragSensitivity;
        
        // Always update longitude (horizontal rotation)
        lon = deltaX + onPointerDownLon;
        
        // Update latitude with clamping (prevents trying to go past the poles naturally)
        const newLat = deltaY + onPointerDownLat;
        lat = Math.max(-MAX_LAT_DEG, Math.min(MAX_LAT_DEG, newLat));
        
        // REMOVED: The problematic pole conversion logic that caused 180-degree flips/blocking
    }
}

function onMouseUp() {
    isUserInteracting = false;
}

// Mouse wheel zoom (UNCHANGED)
function onMouseWheel(event) {
    event.preventDefault();

    const delta = event.deltaY || event.detail || event.wheelDelta;

    if (delta > 0) {
        currentZoom = Math.min(maxZoom, currentZoom + zoomSensitivity);
    } else {
        currentZoom = Math.max(minZoom, currentZoom - zoomSensitivity);
    }

    camera.fov = currentZoom;
    camera.updateProjectionMatrix();
}

// Touch interaction handlers (MODIFIED: Simplified lat clamping to avoid explicit flip logic)
function onTouchStart(event) {
    event.preventDefault();

    if (event.touches.length === 1) {
        isUserInteracting = true;

        onPointerDownMouseX = event.touches[0].pageX;
        onPointerDownMouseY = event.touches[0].pageY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;

    } else if (event.touches.length === 2) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
    }
}

function onTouchMove(event) {
    if (event.touches.length === 1 && isUserInteracting) {
        event.preventDefault();

        const deltaX = (onPointerDownMouseX - event.touches[0].pageX) * dragSensitivity;
        const deltaY = (event.touches[0].pageY - onPointerDownMouseY) * dragSensitivity;
        
        // Always update longitude (horizontal rotation)
        lon = deltaX + onPointerDownLon;
        
        // Update latitude with clamping (prevents trying to go past the poles naturally)
        const newLat = deltaY + onPointerDownLat;
        lat = Math.max(-MAX_LAT_DEG, Math.min(MAX_LAT_DEG, newLat));
        
        // REMOVED: The problematic pole conversion logic that caused 180-degree flips/blocking

    } else if (event.touches.length === 2) {
        // ... rest of pinch zoom code stays the same
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        touchDistance = Math.sqrt(dx * dx + dy * dy);

        if (prevTouchDistance > 0) {
            const zoomFactor = touchDistance / prevTouchDistance;
            currentZoom = currentZoom / zoomFactor;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));

            camera.fov = currentZoom;
            camera.updateProjectionMatrix();
        }
        prevTouchDistance = touchDistance;
    }
}

function onTouchEnd(event) {
    isUserInteracting = false;
    touchDistance = 0;
    prevTouchDistance = 0;
}

// Window resize handler (UNCHANGED)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Audio toggle with image icons (UNCHANGED)
function toggleAudio() {
    const audioIcon = document.getElementById('audio-icon');
    const isMuted = audioIcon.classList.contains('muted');

    if (isMuted) {
        audioIcon.classList.remove('muted');
        audioIcon.classList.add('playing');
        audioIcon.src = 'assets/audio-on.png';
    } else {
        audioIcon.classList.remove('playing');
        audioIcon.classList.add('muted');
        audioIcon.src = 'assets/audio-off.png';
    }
}

// UI Panel toggle functions (UNCHANGED)
function toggleUIPanel() {
    if (uiPanelVisible) {
        hideUIPanel();
    } else {
        showUIPanel();
    }
}

function showUIPanel() {
    const panel = document.getElementById('ui-panel');
    const toggleButton = document.getElementById('ui-toggle-button');
    const btqButton = document.getElementById('btq-button');

    panel.classList.add('visible');
    toggleButton.classList.remove('visible');
    toggleButton.classList.add('panel-open');
    btqButton.classList.add('hidden'); // Hide BTQ button
    uiPanelVisible = true;
}

function hideUIPanel() {
    const panel = document.getElementById('ui-panel');
    const toggleButton = document.getElementById('ui-toggle-button');
    const btqButton = document.getElementById('btq-button');

    panel.classList.remove('visible');
    toggleButton.classList.remove('panel-open');
    toggleButton.classList.add('visible');
    btqButton.classList.remove('hidden'); // Show BTQ button
    uiPanelVisible = false;
}

// Auto-rotation toggle (UNCHANGED)
function toggleAutoRotate() {
    const button = document.getElementById('auto-rotate-toggle');
    const icon = document.getElementById('auto-rotate-icon');

    autoRotateEnabled = !autoRotateEnabled;

    if (autoRotateEnabled) {
        button.classList.add('active');
        // Start custom rotation animation
        startIconRotation(icon);
        button.title = 'Disable Auto-Rotation';
    } else {
        button.classList.remove('active');
        // Stop rotation but keep current position
        stopIconRotation(icon);
        button.title = 'Enable Auto-Rotation';
    }
}

function startIconRotation(icon) {
    if (animationId) return; // Already running
    
    function rotateIcon() {
        iconRotationAngle += 0.5; // Slow rotation speed
        icon.style.transform = `rotate(${iconRotationAngle}deg)`;
        animationId = requestAnimationFrame(rotateIcon);
    }
    
    rotateIcon();
}

function stopIconRotation(icon) {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    // Keep the current rotation angle - don't reset to 0
}

// BTQ360 website opener (UNCHANGED)
function openBTQ360() {
    window.open('https://btq360.com', '_blank');
}

// Generic function to hide loading overlay and show UI (UNCHANGED)
function hideLoadingOverlayAndShowUI() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('hidden');

    setTimeout(() => {
        showUIPanel();

        const audioControls = document.getElementById('audio-controls');
        const audioButton = document.getElementById('audio-toggle');
        if (audioControls && audioButton) {
            console.log('Audio controls found and should be visible');
            audioControls.style.display = 'block';
            audioControls.style.opacity = '1';
            audioControls.style.visibility = 'visible';
        } else {
            console.error('Audio controls not found!', { audioControls, audioButton });
        }
    }, 500);
}

// Button handlers for navigation (UNCHANGED)
function goBack() {
    console.log('Going back...');
    // Add your back navigation logic here, e.g., window.history.back();
}

function goToPrevious() {
    currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
    loadEnvironmentTexture(imageUrls[currentImageIndex]);
}

function goToNext() {
    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    loadEnvironmentTexture(imageUrls[currentImageIndex]);
}

// Animation loop (MODIFIED: Add camera.up stabilization for lookAt)
function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation when not interacting
    if (!isUserInteracting && autoRotateEnabled) {
        lon += autoRotateSpeed;
    }

    // Update camera position based on lat/lon
    if (mirrorBallMesh) {
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        
        const distance = 3.5;
        
        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        
        // CRITICAL FIX: Manually stabilize camera.up vector near poles
        // This prevents the 180-degree flip caused by lookAt's ambiguity
        const upBias = Math.abs(lat) / MAX_LAT_DEG; // 0 at equator, 1 at clamp limit
        
        if (upBias > UP_VECTOR_SMOOTHING_THRESHOLD / MAX_LAT_DEG) { // If close to poles
            const smoothFactor = (upBias - UP_VECTOR_SMOOTHING_THRESHOLD / MAX_LAT_DEG) / (1 - UP_VECTOR_SMOOTHING_THRESHOLD / MAX_LAT_DEG);
            
            // Adjust camera.up towards (0,0,-1) or (0,0,1) depending on which pole
            // This slightly tilts the 'up' vector to avoid perfect alignment with camera's forward.
            // Using a small amount of X or Z helps. Let's try X for horizontal stability.
            const upX = Math.sin(THREE.MathUtils.degToRad(lon)) * smoothFactor * 0.1; // Small horizontal bias
            const upZ = -Math.cos(THREE.MathUtils.degToRad(lon)) * smoothFactor * 0.1; // Small horizontal bias
            
            // Interpolate between (0,1,0) and a slightly biased vector
            camera.up.set(upX, 1 - smoothFactor * 0.1, upZ).normalize(); // Keep Y dominant, add slight X/Z bias
        } else {
            camera.up.set(0, 1, 0); // Default world up
        }

        camera.lookAt(mirrorBallMesh.position);
    }

    renderer.render(scene, camera);
}

// Keyboard controls handler (UNCHANGED)
function onKeyDown(event) {
    // Only prevent default if no modifier keys are pressed
    const hasModifiers = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
    
    if (!hasModifiers) {
        switch(event.code) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'Space':
            case 'KeyR':
                event.preventDefault();
                break;
        }
    }
    
    // Handle the key actions (only if no modifiers)
    if (!hasModifiers) {
        switch(event.code) {
            case 'ArrowRight':
                goToNext();
                break;
                
            case 'ArrowLeft':
                goToPrevious();
                break;
                
            case 'Space':
                toggleUIPanel();
                break;
                
            case 'KeyR':
                toggleAutoRotate();
                break;
        }
    }
}

// Start everything when DOM is loaded
document.addEventListener('DOMContentLoaded', init);