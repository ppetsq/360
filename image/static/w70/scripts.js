// Configuration for viewpoints
const viewpoints = {
    club: [
        { id: 1, panorama: "https://assets.360.petsq.works/w70/club_1.jpg" },
        { id: 2, panorama: "https://assets.360.petsq.works/w70/club_2.jpg" },
        { id: 3, panorama: "https://assets.360.petsq.works/w70/club_3.jpg" },
        { id: 4, panorama: "https://assets.360.petsq.works/w70/club_4.jpg" },
        { id: 5, panorama: "https://assets.360.petsq.works/w70/club_5.jpg" }
    ],
    etage: [
        { id: 1, panorama: "https://assets.360.petsq.works/w70/etage_1.jpg" },
        { id: 2, panorama: "https://assets.360.petsq.works/w70/etage_2.jpg" },
        { id: 3, panorama: "https://assets.360.petsq.works/w70/etage_3.jpg" },
        { id: 4, panorama: "https://assets.360.petsq.works/w70/etage_4.jpg" },
        { id: 5, panorama: "https://assets.360.petsq.works/w70/etage_5.jpg" }
    ]
};

// Viewer states
const viewers = {
    club: {
        currentViewpoint: 1,
        isAutoRotating: false,
        isTransitioning: false,
        scene: null,
        camera: null,
        renderer: null,
        sphere: null,
        targetRotationX: 0,
        targetRotationY: 0,
        mouseXOnMouseDown: 0,
        targetRotationOnMouseDownX: 0,
        mouseYOnMouseDown: 0,
        targetRotationOnMouseDownY: 0,
        isUserInteracting: false
    },
    etage: {
        currentViewpoint: 1,
        isAutoRotating: false,
        isTransitioning: false,
        scene: null,
        camera: null,
        renderer: null,
        sphere: null,
        targetRotationX: 0,
        targetRotationY: 0,
        mouseXOnMouseDown: 0,
        targetRotationOnMouseDownX: 0,
        mouseYOnMouseDown: 0,
        targetRotationOnMouseDownY: 0,
        isUserInteracting: false
    }
};

// Settings
const autoRotateSpeed = 0.0005;
const dragSensitivity = 0.002; // Reduced from 0.005 for stiffer control

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize both viewers
    initViewer('club');
    initViewer('etage');
    
    // Start animation loops
    animate();
    
    // Load initial viewpoints
    loadViewpoint('club', 1, true);
    loadViewpoint('etage', 1, true);
    
    // Hide loading overlay after both are ready
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 800);
    }, 2000);
});

// Initialize a viewer
function initViewer(location) {
    const container = document.getElementById(`${location}-viewer`);
    const viewer = viewers[location];

    // Scene
    viewer.scene = new THREE.Scene();

    // Camera
    viewer.camera = new THREE.PerspectiveCamera(
        70, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    viewer.camera.position.set(0, 0, 0.1);

    // Renderer
    viewer.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    viewer.renderer.setPixelRatio(window.devicePixelRatio);
    viewer.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(viewer.renderer.domElement);

    // Sphere geometry for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert the sphere

    // Create sphere
    const material = new THREE.MeshBasicMaterial({
        map: null
    });
    
    viewer.sphere = new THREE.Mesh(geometry, material);
    viewer.scene.add(viewer.sphere);

    // Event listeners
    container.addEventListener('mousedown', (e) => onMouseDown(e, location), false);
    container.addEventListener('mousemove', (e) => onMouseMove(e, location), false);
    container.addEventListener('mouseup', () => onMouseUp(location), false);
    container.addEventListener('mouseout', () => onMouseUp(location), false);
    
    container.addEventListener('touchstart', (e) => onTouchStart(e, location), { passive: false });
    container.addEventListener('touchmove', (e) => onTouchMove(e, location), { passive: false });
    container.addEventListener('touchend', () => onTouchEnd(location), false);

    window.addEventListener('resize', onWindowResize, false);
}

// Mouse controls
function onMouseDown(event, location) {
    event.preventDefault();
    const viewer = viewers[location];
    viewer.isUserInteracting = true;
    
    viewer.mouseXOnMouseDown = event.clientX;
    viewer.mouseYOnMouseDown = event.clientY;
    viewer.targetRotationOnMouseDownX = viewer.targetRotationX;
    viewer.targetRotationOnMouseDownY = viewer.targetRotationY;
}

function onMouseMove(event, location) {
    const viewer = viewers[location];
    if (viewer.isUserInteracting) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        viewer.targetRotationX = viewer.targetRotationOnMouseDownX + (mouseX - viewer.mouseXOnMouseDown) * dragSensitivity;
        viewer.targetRotationY = Math.max(
            -Math.PI / 3,
            Math.min(
                Math.PI / 3,
                viewer.targetRotationOnMouseDownY + (mouseY - viewer.mouseYOnMouseDown) * dragSensitivity
            )
        );
    }
}

function onMouseUp(location) {
    viewers[location].isUserInteracting = false;
}

// Touch controls
function onTouchStart(event, location) {
    if (event.touches.length === 1) {
        event.preventDefault();
        const viewer = viewers[location];
        viewer.isUserInteracting = true;
        
        viewer.mouseXOnMouseDown = event.touches[0].pageX;
        viewer.mouseYOnMouseDown = event.touches[0].pageY;
        viewer.targetRotationOnMouseDownX = viewer.targetRotationX;
        viewer.targetRotationOnMouseDownY = viewer.targetRotationY;
    }
}

function onTouchMove(event, location) {
    const viewer = viewers[location];
    if (event.touches.length === 1 && viewer.isUserInteracting) {
        event.preventDefault();
        
        const mouseX = event.touches[0].pageX;
        const mouseY = event.touches[0].pageY;
        
        viewer.targetRotationX = viewer.targetRotationOnMouseDownX + (mouseX - viewer.mouseXOnMouseDown) * dragSensitivity;
        viewer.targetRotationY = Math.max(
            -Math.PI / 3,
            Math.min(
                Math.PI / 3,
                viewer.targetRotationOnMouseDownY + (mouseY - viewer.mouseYOnMouseDown) * dragSensitivity
            )
        );
    }
}

function onTouchEnd(location) {
    viewers[location].isUserInteracting = false;
}

// Window resize
function onWindowResize() {
    ['club', 'etage'].forEach(location => {
        const container = document.getElementById(`${location}-viewer`);
        const viewer = viewers[location];
        
        if (viewer.camera && viewer.renderer) {
            viewer.camera.aspect = container.clientWidth / container.clientHeight;
            viewer.camera.updateProjectionMatrix();
            viewer.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    ['club', 'etage'].forEach(location => {
        const viewer = viewers[location];
        
        if (!viewer.sphere || !viewer.camera || !viewer.renderer) return;
        
        // Auto-rotation
        if (viewer.isAutoRotating && !viewer.isUserInteracting && !viewer.isTransitioning) {
            viewer.targetRotationX += autoRotateSpeed;
        }
        
        // Update rotation
        const rotationSpeed = 0.05;
        viewer.sphere.rotation.y += (viewer.targetRotationX - viewer.sphere.rotation.y) * rotationSpeed;
        
        // Vertical rotation with limits
        const verticalRotation = Math.max(-Math.PI/3, Math.min(Math.PI/3, viewer.targetRotationY));
        
        // Position camera based on rotation
        const phi = Math.PI/2 - verticalRotation;
        const theta = viewer.sphere.rotation.y;
        
        viewer.camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
        viewer.camera.position.y = 100 * Math.cos(phi);
        viewer.camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
        
        viewer.camera.lookAt(0, 0, 0);
        
        viewer.renderer.render(viewer.scene, viewer.camera);
    });
}

// Update UI
function updateNavigation(location) {
    const viewer = viewers[location];
    
    // Update active viewpoint
    document.querySelectorAll(`#${location}-viewer ~ .viewpoint-controls .viewpoint-button`).forEach(btn => {
        btn.classList.remove('active');
    });
    const activeViewpoint = document.getElementById(`${location}-${viewer.currentViewpoint}`);
    if (activeViewpoint) activeViewpoint.classList.add('active');
    
    // Update rotate button
    document.getElementById(`${location}-rotate-button`).classList.toggle('active', viewer.isAutoRotating);
}

// Navigation handlers
function switchViewpoint(location, id) {
    const viewer = viewers[location];
    if (viewer.isTransitioning || viewer.currentViewpoint === id) return;
    
    viewer.currentViewpoint = id;
    updateNavigation(location);
    loadViewpoint(location, id);
}

function nextViewpoint(location) {
    const viewer = viewers[location];
    if (viewer.isTransitioning) return;
    const max = viewpoints[location].length;
    switchViewpoint(location, viewer.currentViewpoint >= max ? 1 : viewer.currentViewpoint + 1);
}

function prevViewpoint(location) {
    const viewer = viewers[location];
    if (viewer.isTransitioning) return;
    const max = viewpoints[location].length;
    switchViewpoint(location, viewer.currentViewpoint <= 1 ? max : viewer.currentViewpoint - 1);
}

// Auto-rotation
function startAutoRotate(location) {
    const viewer = viewers[location];
    viewer.isAutoRotating = true;
    updateNavigation(location);
}

function stopAutoRotate(location) {
    const viewer = viewers[location];
    viewer.isAutoRotating = false;
    updateNavigation(location);
}

function toggleAutoRotate(location) {
    const viewer = viewers[location];
    if (viewer.isAutoRotating) {
        stopAutoRotate(location);
    } else {
        startAutoRotate(location);
    }
}

// Load viewpoint with fade transition
function loadViewpoint(location, id, isInitial = false) {
    const viewer = viewers[location];
    const wasAutoRotating = viewer.isAutoRotating;
    
    viewer.isTransitioning = true;
    stopAutoRotate(location);
    
    const viewpoint = viewpoints[location][id - 1];
    const container = document.getElementById(`${location}-viewer`);
    
    console.log(`Loading ${location} panorama:`, viewpoint.panorama);
    
    // Fade out current view
    if (!isInitial) {
        container.style.opacity = '0';
    }
    
    // Load texture with cross-origin support
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        viewpoint.panorama,
        (texture) => {
            console.log('Texture loaded successfully');
            
            // Wait for fade out to complete
            setTimeout(() => {
                // Configure texture
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                // Create new material with texture
                const newMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture
                });
                
                // Replace sphere material
                if (viewer.sphere.material) {
                    viewer.sphere.material.dispose();
                }
                viewer.sphere.material = newMaterial;
                
                // Show viewer with fade in
                container.style.opacity = '1';
                
                // Re-enable auto-rotation after transition
                setTimeout(() => {
                    viewer.isTransitioning = false;
                    if (wasAutoRotating || isInitial) {
                        startAutoRotate(location);
                    }
                }, 800);
            }, isInitial ? 0 : 800);
        },
        // Progress callback
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Error callback
        (error) => {
            console.error('Error loading panorama:', error);
            console.error('Failed URL:', viewpoint.panorama);
            viewer.isTransitioning = false;
            
            // Show error state
            viewer.sphere.material = new THREE.MeshBasicMaterial({ 
                color: 0x333333
            });
            container.style.opacity = '1';
        }
    );
}