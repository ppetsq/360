// Isokari 360° Mirror Ball Experience
// Using Three.js Environment Mapping for authentic mirror ball reflection

// Global variables
let scene, camera, renderer;
let mirrorBallMesh;
let envTexture; // The 360° environment texture
let isUserInteracting = false;
let autoRotateEnabled = true; // Auto-rotation state

// Interaction variables
let targetRotationX = 0;
let targetRotationY = 0;
let mouseXOnMouseDown = 0;
let mouseYOnMouseDown = 0;
let targetRotationOnMouseDownX = 0;
let targetRotationOnMouseDownY = 0;

// Zoom variables
let currentZoom = 90; // Start more zoomed in for mirror ball
const minZoom = 50; // Zoomed in
const maxZoom = 120; // Limited zoom out to prevent black background
const zoomSensitivity = 2;

// Touch zoom variables
let touchDistance = 0;
let prevTouchDistance = 0;

// Settings
const autoRotateSpeed = 0.0005;
const dragSensitivity = 0.003;
const imageUrl = 'https://assets.360.petsq.works/isokari/kalliot-test.jpg';

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
    
    // Load the 360° texture
    loadEnvironmentTexture();
    
    // Setup event listeners
    setupEventListeners();
}

// Load and setup the 360° environment texture
function loadEnvironmentTexture() {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        imageUrl,
        (texture) => {
            // Configure texture for environment mapping (mirror ball)
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.flipY = false;
            
            envTexture = texture;
            
            // Create mirror ball mesh
            createMirrorBallMesh();
            
            // Add to scene
            scene.add(mirrorBallMesh);
            
            // Hide loading overlay
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.classList.add('hidden');
            
            // Start animation loop
            animate();
        },
        (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.error('Error loading texture:', error);
        }
    );
}

// Create the mirror ball mesh using environment mapping
function createMirrorBallMesh() {
    // Create a much larger reflective sphere to eliminate black background
    const geometry = new THREE.SphereGeometry(8, 64, 32); // Increased from 3 to 8
    // Scale to flip the reflection properly (mirror effect)
    geometry.scale(-1, -1, 1); // Flip X and Y to correct the mirror reflection
    
    // Create material with environment mapping
    const material = new THREE.MeshBasicMaterial({
        envMap: envTexture,
        reflectivity: 1.0,
        side: THREE.BackSide // Changed to BackSide because we flipped the geometry
    });
    
    mirrorBallMesh = new THREE.Mesh(geometry, material);
    mirrorBallMesh.position.set(0, 0, -2); // Moved further back to accommodate larger sphere
}

// Setup all event listeners
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
    
    // Controls
    document.getElementById('audio-toggle').addEventListener('click', toggleAudio);
    document.getElementById('auto-rotate-toggle').addEventListener('click', toggleAutoRotate);
    document.getElementById('back-button').addEventListener('click', goBack);
    document.getElementById('prev-button').addEventListener('click', goToPrevious);
    document.getElementById('next-button').addEventListener('click', goToNext);
}

// Mouse interaction handlers
function onMouseDown(event) {
    event.preventDefault();
    isUserInteracting = true;
    
    mouseXOnMouseDown = event.clientX;
    mouseYOnMouseDown = event.clientY;
    targetRotationOnMouseDownX = targetRotationX;
    targetRotationOnMouseDownY = targetRotationY;
}

function onMouseMove(event) {
    if (isUserInteracting) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * dragSensitivity;
        targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * dragSensitivity;
        
        // Remove vertical rotation limits for full mirror ball experience
        // targetRotationY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationY));
    }
}

function onMouseUp() {
    isUserInteracting = false;
}

// Mouse wheel zoom
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

// Touch interaction handlers
function onTouchStart(event) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
        isUserInteracting = true;
        
        mouseXOnMouseDown = event.touches[0].pageX;
        mouseYOnMouseDown = event.touches[0].pageY;
        targetRotationOnMouseDownX = targetRotationX;
        targetRotationOnMouseDownY = targetRotationY;
        
    } else if (event.touches.length === 2) {
        // Pinch to zoom
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
    }
}

function onTouchMove(event) {
    if (event.touches.length === 1 && isUserInteracting) {
        event.preventDefault();
        
        const mouseX = event.touches[0].pageX;
        const mouseY = event.touches[0].pageY;
        
        targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * dragSensitivity;
        targetRotationY = targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * dragSensitivity;
        
        // Remove vertical rotation limits for full mirror ball experience
        // targetRotationY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationY));

    } else if (event.touches.length === 2) {
        // Pinch to zoom
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

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Audio toggle with new symbols
function toggleAudio() {
    const audioIcon = document.getElementById('audio-icon');
    const isMuted = audioIcon.classList.contains('muted');
    
    if (isMuted) {
        audioIcon.classList.remove('muted');
        audioIcon.classList.add('playing');
        audioIcon.textContent = '♫';
    } else {
        audioIcon.classList.remove('playing');
        audioIcon.classList.add('muted');
        audioIcon.textContent = '♪';
    }
}

// Auto-rotation toggle
function toggleAutoRotate() {
    const button = document.getElementById('auto-rotate-toggle');
    const icon = document.getElementById('auto-rotate-icon');
    
    autoRotateEnabled = !autoRotateEnabled;
    
    if (autoRotateEnabled) {
        button.classList.add('active');
        icon.textContent = '⟲';
        button.title = 'Disable Auto-Rotation';
    } else {
        button.classList.remove('active');
        icon.textContent = '⏸';
        button.title = 'Enable Auto-Rotation';
    }
}

// New button handlers
function goBack() {
    console.log('Going back...');
    // Add your back navigation logic here
}

function goToPrevious() {
    console.log('Going to previous...');
    // Add your previous navigation logic here
}

function goToNext() {
    console.log('Going to next...');
    // Add your next navigation logic here
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Auto-rotation when not interacting
    if (!isUserInteracting && autoRotateEnabled) {
        targetRotationX += autoRotateSpeed;
    }
    
    // Apply smooth camera rotation for mirror ball
    const rotationSpeed = 0.05;
    
    if (mirrorBallMesh) {
        // For mirror ball, use proper spherical coordinates to avoid flipping
        const distance = 3.5;
        
        // Convert to spherical coordinates (phi = vertical, theta = horizontal)
        const phi = targetRotationY; // Vertical angle (no limits)
        const theta = targetRotationX; // Horizontal angle
        
        // Convert spherical to cartesian coordinates
        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        
        // Always look at the mirror ball center
        camera.lookAt(mirrorBallMesh.position);
    }
    
    renderer.render(scene, camera);
}

// Start everything when DOM is loaded
document.addEventListener('DOMContentLoaded', init);