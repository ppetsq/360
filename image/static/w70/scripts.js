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
        { id: 1, panorama: "https://assets.360.petsq.works/w70/etage_1_fix.jpg" },
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
        isFullscreen: false,
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
        isFullscreen: false,
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
const dragSensitivity = 0.002;

// Keep track of how many viewers have finished initial loading
let viewersLoadedCount = 0;
const totalViewers = Object.keys(viewers).length;

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

    // Add escape key listener for fullscreen
    document.addEventListener('keydown', (e) => {
        // Find the currently active fullscreen viewer
        let activeFullscreenViewerLocation = null;
        for (const loc in viewers) {
            if (viewers[loc].isFullscreen) {
                activeFullscreenViewerLocation = loc;
                break;
            }
        }

        if (activeFullscreenViewerLocation) {
            switch (e.key) {
                case ' ': // Space bar
                    e.preventDefault(); // Prevent scrolling
                    toggleAutoRotate(activeFullscreenViewerLocation);
                    break;
                case 'ArrowLeft': // Left arrow key
                    e.preventDefault();
                    prevViewpoint(activeFullscreenViewerLocation);
                    break;
                case 'ArrowRight': // Right arrow key
                    e.preventDefault();
                    nextViewpoint(activeFullscreenViewerLocation);
                    break;
                case 'Escape': // Escape key
                    e.preventDefault();
                    exitFullscreen();
                    break;
            }
        } else if (e.key === 'Escape') {
            // Allow escape to exit if no specific viewer is in fullscreen (e.g., if a modal was active)
            exitFullscreen();
        }
    });
});

// Fullscreen functionality
function toggleFullscreen(location) {
    const viewer = viewers[location];
    const wrapper = document.querySelector(`#${location}-viewer`).parentElement;
    
    if (viewer.isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen(location, wrapper);
    }
}

function enterFullscreen(location, wrapper) {
    const viewer = viewers[location];
    
    // Exit any other fullscreen viewers first
    Object.keys(viewers).forEach(loc => {
        if (loc !== location && viewers[loc].isFullscreen) {
            exitFullscreen();
        }
    });
    
    viewer.isFullscreen = true;
    wrapper.classList.add('fullscreen');
    
    // Update icon
    const icon = document.getElementById(`${location}-fullscreen-icon`);
    icon.classList.remove('fa-expand');
    icon.classList.add('fa-compress');
    
    // Resize renderer after transition
    setTimeout(() => {
        onWindowResize();
    }, 100);
}

function exitFullscreen() {
    Object.keys(viewers).forEach(location => {
        const viewer = viewers[location];
        if (viewer.isFullscreen) {
            const wrapper = document.querySelector(`#${location}-viewer`).parentElement;
            
            viewer.isFullscreen = false;
            wrapper.classList.remove('fullscreen');
            
            // Update icon
            const icon = document.getElementById(`${location}-fullscreen-icon`);
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            
            // Resize renderer after transition
            setTimeout(() => {
                onWindowResize();
            }, 100);
        }
    });
}

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

// Update UI (viewpoint dots and auto-rotate button)
function updateNavigation(location) {
    const viewer = viewers[location];
    
    // Update all viewpoint buttons (desktop, mobile, and fullscreen)
    const allViewpointButtons = document.querySelectorAll(`[id^="${location}-"]:not([id$="rotate-button"]):not([id$="fullscreen-icon"]):not([id$="fullscreen-nav"])`);
    allViewpointButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to current viewpoint buttons
    const activeButtons = document.querySelectorAll(`#${location}-${viewer.currentViewpoint}, #${location}-fs-${viewer.currentViewpoint}`);
    activeButtons.forEach(btn => {
        btn.classList.add('active');
    });
    
    // Update all rotate buttons (desktop, mobile, and fullscreen)
    const rotateButtons = document.querySelectorAll(`#${location}-rotate-button, #${location}-fs-rotate-button`);
    rotateButtons.forEach(btn => {
        btn.classList.toggle('active', viewer.isAutoRotating);
    });
}

// Navigation handlers
function switchViewpoint(location, id) {
    const viewer = viewers[location];
    // Prevent switching to the same viewpoint if it's currently transitioning
    if (viewer.isTransitioning && viewer.currentViewpoint === id) return;
    
    viewer.currentViewpoint = id;
    // The updateNavigation will be called inside loadViewpoint after the panorama loads and fades in.
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
    updateNavigation(location); // Update button state
}

function stopAutoRotate(location) {
    const viewer = viewers[location];
    viewer.isAutoRotating = false;
    updateNavigation(location); // Update button state
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
    stopAutoRotate(location); // Stop rotation during transition
    
    const viewpoint = viewpoints[location][id - 1]; // Get viewpoint data by id (1-based)
    const container = document.getElementById(`${location}-viewer`);
    
    // Fade out current view (only if not initial load)
    if (!isInitial) {
        container.style.opacity = '0';
    }
    
    // Load texture with cross-origin support
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        viewpoint.panorama,
        (texture) => {
            // Wait for fade out to complete (or immediately if initial load)
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
                
                // Re-enable auto-rotation and update navigation after transition
                setTimeout(() => {
                    viewer.isTransitioning = false;
                    if (wasAutoRotating || isInitial) {
                        startAutoRotate(location);
                    }
                    // Crucial: Update navigation *after* the fade-in animation completes
                    // to correctly set the active state on the dot when the panorama is visible.
                    updateNavigation(location); 

                    // Check if all initial viewers are loaded to hide the global loading overlay
                    if (isInitial) {
                        viewersLoadedCount++;
                        if (viewersLoadedCount === totalViewers) {
                            const loadingOverlay = document.getElementById('loading-overlay');
                            if (loadingOverlay) { 
                                loadingOverlay.style.opacity = '0';
                                setTimeout(() => {
                                    loadingOverlay.style.display = 'none';
                                }, 800); // Match this with CSS transition for opacity
                            }
                        }
                    }

                }, 800); // This delay should match your CSS transition duration for opacity
            }, isInitial ? 0 : 800); // This delay should match your CSS transition duration for opacity
        },
        // Progress callback (optional, for loading indicators)
        (xhr) => {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Removed for production
        },
        // Error callback
        (error) => {
            console.error('Error loading panorama:', error);
            console.error('Failed URL:', viewpoint.panorama);
            viewer.isTransitioning = false;
            
            // Show error state (e.g., black background)
            if (viewer.sphere && viewer.sphere.material) {
                viewer.sphere.material.dispose();
                viewer.sphere.material = new THREE.MeshBasicMaterial({ 
                    color: 0x333333 // Set to a dark color on error
                });
            }
            container.style.opacity = '1'; // Ensure container is visible
            
            // Update navigation even on error to reflect the intended current state.
            updateNavigation(location); 
            if (wasAutoRotating) { // If auto-rotating was on, try to re-enable it (might not work well with solid color)
                startAutoRotate(location);
            }

            // Also handle loading overlay if initial load fails for a viewer
            if (isInitial) {
                viewersLoadedCount++;
                if (viewersLoadedCount === totalViewers) {
                    const loadingOverlay = document.getElementById('loading-overlay');
                    if (loadingOverlay) { 
                        loadingOverlay.style.opacity = '0';
                        setTimeout(() => {
                            loadingOverlay.style.display = 'none';
                        }, 800);
                    }
                }
            }
        }
    );
}