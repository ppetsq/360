// Isokari 360° Mirror Ball Viewer

// Global variables
let scene, camera, renderer, sphere, material;
let isUserInteracting = false;
let isMirrorBall = true;
let targetRotationX = 0;
let targetRotationY = 0;
let mouseXOnMouseDown = 0;
let mouseYOnMouseDown = 0;
let targetRotationOnMouseDownX = 0;
let targetRotationOnMouseDownY = 0;

// Settings
const autoRotateSpeed = 0.0003;
const dragSensitivity = 0.002;
const imageUrl = 'https://assets.360.petsq.works/isokari/kalliot-test.jpg';

// Mirror Ball Fragment Shader - Correct Stereographic Projection
const mirrorBallFragmentShader = `
uniform sampler2D tDiffuse;
varying vec2 vUv;

vec2 stereographicToEquirectangular(vec2 uv) {
    // Convert UV coordinates to stereographic coordinates
    // Center at origin, with radius representing the projection
    vec2 centered = (uv - 0.5) * 2.0;
    float x = centered.x;
    float y = centered.y;
    
    // Calculate distance from center
    float rho = sqrt(x * x + y * y);
    
    // If we're too far from center, return invalid (black)
    if (rho > 2.0) {
        return vec2(-1.0);
    }
    
    // Stereographic projection inverse formulas from Mathworld
    // These convert from stereographic coordinates back to lat/lon
    float c = 2.0 * atan(rho / 2.0);
    
    // Handle the center point (avoid division by zero)
    if (rho < 0.001) {
        // Center of stereographic = south pole in this configuration
        return vec2(0.5, 1.0);
    }
    
    // Calculate latitude (phi) and longitude (lambda)
    float phi0 = -1.5707963268; // -PI/2 (south pole as center)
    float lambda0 = 0.0;        // Prime meridian
    
    float phi = asin(cos(c) * sin(phi0) + (y * sin(c) * cos(phi0) / rho));
    float lambda = lambda0 + atan(x * sin(c), (rho * cos(phi0) * cos(c) - y * sin(phi0) * sin(c)));
    
    // Convert spherical coordinates to equirectangular UV
    float u = (lambda + 3.14159265359) / (2.0 * 3.14159265359);
    float v = (phi + 1.5707963268) / 3.14159265359;
    
    return vec2(u, v);
}

void main() {
    vec2 equiUv = stereographicToEquirectangular(vUv);
    
    if (equiUv.x < 0.0) {
        // Outside the valid projection area
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = texture2D(tDiffuse, equiUv);
    }
}
`;

// Standard Fragment Shader (for comparison)
const standardFragmentShader = `
uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(tDiffuse, vUv);
}
`;

// Vertex Shader (same for both)
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Initialize the viewer
function init() {
    const container = document.getElementById('viewer-container');
    
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0.1);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert for inside view
    
    // Load texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        imageUrl,
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Create material with mirror ball shader
            material = new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: { value: texture }
                },
                vertexShader: vertexShader,
                fragmentShader: mirrorBallFragmentShader
            });
            
            // Create sphere
            sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);
            
            // Hide loading overlay
            const loadingOverlay = document.getElementById('loading-overlay');
            loadingOverlay.classList.add('hidden');
            
            // Start animation
            animate();
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('Error loading texture:', error);
        }
    );
    
    // Event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    const container = document.getElementById('viewer-container');
    
    // Mouse events
    container.addEventListener('mousedown', onMouseDown, false);
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseUp, false);
    
    // Touch events
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, false);
    
    // Window resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Development controls
    document.getElementById('toggle-projection').addEventListener('click', toggleProjection);
    document.getElementById('audio-toggle').addEventListener('click', toggleAudio);
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
        targetRotationY = Math.max(
            -Math.PI / 3,
            Math.min(
                Math.PI / 3,
                targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * dragSensitivity
            )
        );
    }
}

function onMouseUp() {
    isUserInteracting = false;
}

// Touch interaction handlers
function onTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        isUserInteracting = true;
        
        mouseXOnMouseDown = event.touches[0].pageX;
        mouseYOnMouseDown = event.touches[0].pageY;
        targetRotationOnMouseDownX = targetRotationX;
        targetRotationOnMouseDownY = targetRotationY;
    }
}

function onTouchMove(event) {
    if (event.touches.length === 1 && isUserInteracting) {
        event.preventDefault();
        
        const mouseX = event.touches[0].pageX;
        const mouseY = event.touches[0].pageY;
        
        targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * dragSensitivity;
        targetRotationY = Math.max(
            -Math.PI / 3,
            Math.min(
                Math.PI / 3,
                targetRotationOnMouseDownY + (mouseY - mouseYOnMouseDown) * dragSensitivity
            )
        );
    }
}

function onTouchEnd() {
    isUserInteracting = false;
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Toggle between mirror ball and standard projection
function toggleProjection() {
    if (!material) return;
    
    isMirrorBall = !isMirrorBall;
    
    if (isMirrorBall) {
        material.fragmentShader = mirrorBallFragmentShader;
        document.getElementById('toggle-projection').textContent = 'Switch to Normal View';
        document.querySelector('.dev-info span').textContent = 'Current: Mirror Ball';
    } else {
        material.fragmentShader = standardFragmentShader;
        document.getElementById('toggle-projection').textContent = 'Switch to Mirror Ball';
        document.querySelector('.dev-info span').textContent = 'Current: Normal View';
    }
    
    material.needsUpdate = true;
}

// Audio toggle (placeholder for now)
function toggleAudio() {
    const audioIcon = document.getElementById('audio-icon');
    const isMuted = audioIcon.classList.contains('muted');
    
    if (isMuted) {
        audioIcon.classList.remove('muted');
        audioIcon.classList.add('playing');
        audioIcon.textContent = '🔊';
    } else {
        audioIcon.classList.remove('playing');
        audioIcon.classList.add('muted');
        audioIcon.textContent = '🔇';
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!sphere) return;
    
    // Auto-rotation when not interacting
    if (!isUserInteracting) {
        targetRotationX += autoRotateSpeed;
    }
    
    // Smooth rotation
    const rotationSpeed = 0.05;
    sphere.rotation.y += (targetRotationX - sphere.rotation.y) * rotationSpeed;
    
    // Vertical rotation with limits
    const verticalRotation = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRotationY));
    
    // Position camera based on rotation
    const phi = Math.PI/2 - verticalRotation;
    const theta = sphere.rotation.y;
    
    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
    
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// Start everything when DOM is loaded
document.addEventListener('DOMContentLoaded', init);