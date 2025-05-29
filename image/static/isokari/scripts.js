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
let currentZoom = 70; // Initial FOV for zoom
const minZoom = 20; // Minimum FOV (zoomed in)
const maxZoom = 90; // Maximum FOV (zoomed out)
const zoomSensitivity = 1; // How fast zoom changes

// Touch zoom variables
let touchDistance = 0;
let prevTouchDistance = 0;

// Settings
const autoRotateSpeed = 0.0003;
const dragSensitivity = 0.002;
const imageUrl = 'https://assets.360.petsq.works/isokari/kalliot-test.jpg';

// Mirror Ball Fragment Shader - Correct Spherical Mirror Reflection
const mirrorBallFragmentShader = `
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform mat4 projectionMatrixInverse; // Inverse of camera's projection matrix
uniform mat4 viewMatrixInverse;       // Inverse of camera's view matrix (world matrix)
uniform float mirrorBallRadius;       // Radius of the simulated mirror ball
uniform vec3 mirrorBallPosition;      // Position of the simulated mirror ball in world space

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

// Function to get the world-space ray from the camera through the current fragment
vec3 getRayFromCamera(vec2 screenUV) {
    // Convert screen UV to clip space (-1 to 1)
    vec4 clipCoords = vec4(screenUV * 2.0 - 1.0, -1.0, 1.0); // Z = -1 for NDC ray origin
    
    // Transform from clip space to view space
    vec4 viewCoords = projectionMatrixInverse * clipCoords;
    viewCoords.z = -1.0; // Ensure it's a forward-pointing ray in view space
    viewCoords.w = 0.0;  // This is a direction vector, so w should be 0
    
    // Transform from view space to world space (camera's world matrix)
    vec3 rayDirection = normalize((viewMatrixInverse * viewCoords).xyz);
    
    return rayDirection;
}

vec2 mirrorBallToEquirectangular(vec2 uv) {
    // Get the camera's world position from the inverse view matrix (last column)
    vec3 cameraWorldPos = viewMatrixInverse[3].xyz;

    // Get the incident ray from the camera through this fragment's screen UV
    vec3 incidentRayDirection = getRayFromCamera(vUv);

    // Calculate intersection with the simulated mirror ball (sphere)
    // Sphere equation: (P - C) . (P - C) = R^2
    // Ray equation: P = O + tD, where O = cameraWorldPos, D = incidentRayDirection
    // Substitute P into sphere equation: (O + tD - C) . (O + tD - C) = R^2
    // Let L = O - C (vector from sphere center to camera)
    // (L + tD) . (L + tD) = R^2
    // L.L + 2t(L.D) + t^2(D.D) = R^2
    // Since D is normalized, D.D = 1
    // t^2 + 2t(L.D) + (L.L - R^2) = 0  (quadratic equation: At^2 + Bt + C = 0)
    
    vec3 L = cameraWorldPos - mirrorBallPosition;
    float a = dot(incidentRayDirection, incidentRayDirection); // Should be 1.0 if normalized
    float b = 2.0 * dot(incidentRayDirection, L);
    float c = dot(L, L) - mirrorBallRadius * mirrorBallRadius;
    
    float discriminant = b * b - 4.0 * a * c;
    
    // If discriminant is negative, ray does not intersect the sphere
    if (discriminant < 0.0) {
        return vec2(-1.0); // Invalid UV
    }
    
    // Calculate the two possible intersection points (t values)
    float t0 = (-b - sqrt(discriminant)) / (2.0 * a);
    float t1 = (-b + sqrt(discriminant)) / (2.0 * a);
    
    // We want the closest intersection point that is in front of the camera
    float t = -1.0;
    if (t0 > 0.0) t = t0;
    else if (t1 > 0.0) t = t1;
    
    if (t < 0.0) {
        return vec2(-1.0); // No intersection in front of camera
    }

    // Point of intersection on the mirror ball surface (world space)
    vec3 intersectionPointWorld = cameraWorldPos + t * incidentRayDirection;
    
    // Normal at the intersection point (world space)
    vec3 mirrorNormalWorld = normalize(intersectionPointWorld - mirrorBallPosition);
    
    // Reflected ray direction (world space)
    vec3 reflectedRayDirection = reflect(incidentRayDirection, mirrorNormalWorld);
    
    // Convert reflected ray to spherical coordinates for equirectangular mapping
    // Equirectangular mapping: U maps longitude, V maps latitude.
    // X, Y, Z coordinates correspond to a point on the unit sphere.
    // Longitude (theta) is angle around Y-axis: atan2(x, z)
    // Latitude (phi) is angle from equator: asin(y)
    
    float longitude = atan(reflectedRayDirection.x, reflectedRayDirection.z); 
    float latitude = asin(reflectedRayDirection.y);
    
    // Map to equirectangular UV coordinates
    // u: [0, 1] maps from [-PI, PI] (longitude)
    float u = (longitude + PI) / TWO_PI;
    // v: [0, 1] maps from [-PI/2, PI/2] (latitude) to [0, 1] (inverted for texture sampling)
    // 0.5 - (latitude / PI) maps [-PI/2, PI/2] to [1, 0] (correct for most panoramas)
    float v = 0.5 - (latitude / PI); 
    
    return vec2(u, v);
}

void main() {
    vec2 equiUv = mirrorBallToEquirectangular(vUv);
    
    if (equiUv.x < 0.0 || equiUv.x > 1.0 || equiUv.y < 0.0 || equiUv.y > 1.0) {
        // Outside the sphere or calculated UV is out of bounds
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black or transparent
    } else {
        // Sample the equirectangular texture
        vec4 color = texture2D(tDiffuse, equiUv);
        
        // Add subtle vignetting for more realistic mirror ball effect
        vec2 centered = (vUv - 0.5) * 2.0;
        float r_squared = dot(centered, centered);
        float vignette = 1.0 - smoothstep(0.7, 1.0, r_squared); // Apply smoothstep to squared radius
        color.rgb *= vignette;
        
        gl_FragColor = color;
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
        currentZoom, // Use currentZoom for initial FOV
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0); // Camera at origin for panorama
    camera.lookAt(0, 0, 0); // Always look at origin

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Create an initial sphere for the standard view.
    const initialGeometry = new THREE.SphereGeometry(500, 60, 40);
    initialGeometry.scale(-1, 1, 1); // Invert for inside view

    // Load texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        imageUrl,
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Create material
            material = new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: { value: texture },
                    // These uniforms will be dynamically updated
                    projectionMatrixInverse: { value: new THREE.Matrix4() },
                    viewMatrixInverse: { value: new THREE.Matrix4() },
                    mirrorBallRadius: { value: 0.8 }, // Initial simulated mirror ball radius (adjust as needed)
                    mirrorBallPosition: { value: new THREE.Vector3(0, 0, -1) } // Initial simulated mirror ball position (adjust as needed)
                },
                vertexShader: vertexShader,
                fragmentShader: standardFragmentShader // Start in normal mode
            });
            
            // Create sphere with initial standard material
            sphere = new THREE.Mesh(initialGeometry, material);
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

// Update shader uniforms
function updateShaderUniforms() {
    if (material) { // Always update these if material exists
        // Update camera's inverse projection and view matrices
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(); // Ensure camera's world matrix is up-to-date
        
        // Get inverse matrices
        material.uniforms.projectionMatrixInverse.value.copy(camera.projectionMatrix).invert();
        material.uniforms.viewMatrixInverse.value.copy(camera.matrixWorld); // camera.matrixWorld is the inverse of viewMatrix
        
        // Update mirror ball position and radius if in mirror ball mode
        if (isMirrorBall) {
            // Adjust mirrorBallPosition and mirrorBallRadius based on desired effect.
            // For a central 'Christmas ornament' effect, a small negative Z position (in front of camera)
            // and a small radius relative to camera's view is good.
            // These values might need fine-tuning after testing.
            material.uniforms.mirrorBallRadius.value = 0.8; // Example: 0.8 unit radius
            material.uniforms.mirrorBallPosition.value.set(0, 0, -1.5); // Example: 1.5 units in front of camera
        }
    }
}


// Setup event listeners
function setupEventListeners() {
    const container = document.getElementById('viewer-container');
    
    // Mouse events
    container.addEventListener('mousedown', onMouseDown, false);
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseUp, false);
    container.addEventListener('wheel', onMouseWheel, { passive: false }); // For zoom

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
        
        targetRotationX = targetRotationOnMouseDownX - (mouseX - mouseXOnMouseDown) * dragSensitivity; // Inverted for natural drag
        targetRotationY = targetRotationOnMouseDownY - (mouseY - mouseYOnMouseDown) * dragSensitivity; // Inverted for natural drag
        
        // Clamp vertical rotation to prevent flipping
        targetRotationY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationY));
    }
}

function onMouseUp() {
    isUserInteracting = false;
}

// Mouse wheel zoom
function onMouseWheel(event) {
    event.preventDefault(); // Prevent page scrolling

    const delta = event.deltaY || event.detail || event.wheelDelta;
    
    if (delta > 0) { // Scroll down (zoom out)
        currentZoom = Math.min(maxZoom, currentZoom + zoomSensitivity);
    } else { // Scroll up (zoom in)
        currentZoom = Math.max(minZoom, currentZoom - zoomSensitivity);
    }
    
    camera.fov = currentZoom;
    camera.updateProjectionMatrix();
    updateShaderUniforms(); // Update shader uniforms with new FOV
}

// Touch interaction handlers
function onTouchStart(event) {
    event.preventDefault(); // Prevent default touch actions (e.g., scrolling)
    
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
        
        targetRotationX = targetRotationOnMouseDownX - (mouseX - mouseXOnMouseDown) * dragSensitivity;
        targetRotationY = targetRotationOnMouseDownY - (mouseY - mouseYOnMouseDown) * dragSensitivity;
        
        targetRotationY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationY));

    } else if (event.touches.length === 2) {
        // Pinch to zoom
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        touchDistance = Math.sqrt(dx * dx + dy * dy);

        if (prevTouchDistance > 0) {
            const zoomFactor = touchDistance / prevTouchDistance;
            // Adjust FOV based on pinch direction
            currentZoom = currentZoom / zoomFactor; 
            currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom)); // Clamp zoom

            camera.fov = currentZoom;
            camera.updateProjectionMatrix();
            updateShaderUniforms(); // Update shader uniforms with new FOV
        }
        prevTouchDistance = touchDistance;
    }
}

function onTouchEnd(event) {
    isUserInteracting = false;
    touchDistance = 0;
    prevTouchDistance = 0; // Reset pinch zoom state
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateShaderUniforms(); // Update shader uniforms on resize
}

// Toggle between mirror ball and standard projection
function toggleProjection() {
    if (!material) return;
    
    isMirrorBall = !isMirrorBall;
    
    if (isMirrorBall) {
        // Switch to plane for mirror ball
        sphere.geometry.dispose(); // Dispose old geometry
        sphere.geometry = new THREE.PlaneGeometry(2, 2); // Create new plane geometry
        material.fragmentShader = mirrorBallFragmentShader;
        
        // Ensure all mirror ball uniforms are set and updated
        material.uniforms.projectionMatrixInverse = { value: new THREE.Matrix4() };
        material.uniforms.viewMatrixInverse = { value: new THREE.Matrix4() };
        material.uniforms.mirrorBallRadius = { value: 0.8 };
        material.uniforms.mirrorBallPosition = { value: new THREE.Vector3(0, 0, -1.5) };
        updateShaderUniforms(); 

        document.getElementById('toggle-projection').textContent = 'Switch to Normal View';
        document.querySelector('.dev-info span').textContent = 'Current: Mirror Ball';
    } else {
        // Switch to sphere for normal 360
        sphere.geometry.dispose(); // Dispose old geometry
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert for inside view
        sphere.geometry = geometry;
        material.fragmentShader = standardFragmentShader;
        
        // Clean up mirror ball specific uniforms
        if (material.uniforms.projectionMatrixInverse) delete material.uniforms.projectionMatrixInverse;
        if (material.uniforms.viewMatrixInverse) delete material.uniforms.viewMatrixInverse;
        if (material.uniforms.mirrorBallRadius) delete material.uniforms.mirrorBallRadius;
        if (material.uniforms.mirrorBallPosition) delete material.uniforms.mirrorBallPosition;
        
        document.getElementById('toggle-projection').textContent = 'Switch to Mirror Ball';
        document.querySelector('.dev-info span').textContent = 'Current: Normal View';
    }
    
    material.needsUpdate = true; // Tell Three.js to recompile the shader
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
    
    // Smooth rotation for horizontal (Y-axis)
    const rotationSpeed = 0.05;
    sphere.rotation.y += (targetRotationX - sphere.rotation.y) * rotationSpeed;
    
    // Smooth rotation for vertical (X-axis)
    sphere.rotation.x += (targetRotationY - sphere.rotation.x) * rotationSpeed;

    // Update shader uniforms every frame, especially important for camera matrices and position
    updateShaderUniforms();
    
    renderer.render(scene, camera);
}

// Start everything when DOM is loaded
document.addEventListener('DOMContentLoaded', init);