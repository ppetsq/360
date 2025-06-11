// Configuration for viewpoints with UV texture coordinate hotspots
const viewpoints = {
    club: [
        { 
            id: 1, 
            panorama: "https://assets.360.petsq.works/w70_2/club_001.jpg",
            startX: -15,
            startY: 15,
            hotspots: [
                { id: 'to_3', target: 3, position: { u: 0, v: 0.507 } },
                { id: 'to_4', target: 4, position: { u: 0.5, v: 0.5 } },
            ]
        },
        { 
            id: 2, 
            panorama: "https://assets.360.petsq.works/w70_2/club_002.jpg",
            startX: -20,
            startY: 15,
            hotspots: [
                { id: 'to_3', target: 3, position: { u: 0.335, v: 0.5 } },
            ]
        },
        { 
            id: 3, 
            panorama: "https://assets.360.petsq.works/w70_2/club_003.jpg",
            startX: 50,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.769, v: 0.5 } },
                { id: 'to_2', target: 2, position: { u: 0.264, v: 0.52 } },
            ]
        },
        { 
            id: 4, 
            panorama: "https://assets.360.petsq.works/w70_2/club_004.jpg",
            startX: -60,
            startY: 15,
            hotspots: [
                { id: 'to_5', target: 5, position: { u: 0.982, v: 0.5 } },
                { id: 'to_1', target: 1, position: { u: 0.492, v: 0.5 } },
            ]
        },
        { 
            id: 5, 
            panorama: "https://assets.360.petsq.works/w70_2/club_005.jpg",
            startX: -50,
            startY: 15,
            hotspots: [
                { id: 'to_4', target: 4, position: { u: 0.088, v: 0.5 } }
            ]
        }
    ],
    etage: [
        { 
            id: 1, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_02.jpg",
            startX: -15,
            startY: 15,
            hotspots: [
                { id: 'to_3', target: 3, position: { u: 0.655, v: 0.55 } },
                { id: 'to_5', target: 5, position: { u: 0.7, v: 0.52 } },
                { id: 'to_2', target: 2, position: { u: 0.292, v: 0.55 } }
            ]
        },
        { 
            id: 2, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_01.jpg",
            startX: 70,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.048, v: 0.65 } },
                { id: 'to_3', target: 3, position: { u: 0, v: 0.52 } }
            ]
        },
        { 
            id: 3, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_03.jpg",
            startX: -10,
            startY: 15,
            hotspots: [
                { id: 'to_4', target: 4, position: { u: 0.585, v: 0.5 } },
                { id: 'to_2', target: 2, position: { u: 0.088, v: 0.52 } },
                { id: 'to_5', target: 5, position: { u: 0.672, v: 0.52 } },
                { id: 'to_1', target: 1, position: { u: 0.020, v: 0.58 } }
            ]
        },
        { 
            id: 4, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_04.jpg",
            startX: -90,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.78, v: 0.53 } },
                { id: 'to_3', target: 3, position: { u: 0.84, v: 0.52 } },
                { id: 'to_5', target: 5, position: { u: 0.66, v: 0.55 } }
            ]
        },
        { 
            id: 5, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_05.jpg",
            startX: -20,
            startY: 15,
            hotspots: [
                { id: 'to_3', target: 3, position: { u: 0.29, v: 0.54 } },
                { id: 'to_4', target: 4, position: { u: 0.525, v: 0.5 } }
            ]
        }
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
        currentRotationX: 0,
        currentRotationY: 0,
        mouseXOnMouseDown: 0,
        targetRotationOnMouseDownX: 0,
        mouseYOnMouseDown: 0,
        targetRotationOnMouseDownY: 0,
        isUserInteracting: false,
        animationId: null
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
        currentRotationX: 0,
        currentRotationY: 0,
        mouseXOnMouseDown: 0,
        targetRotationOnMouseDownX: 0,
        mouseYOnMouseDown: 0,
        targetRotationOnMouseDownY: 0,
        isUserInteracting: false,
        animationId: null
    }
};

// Settings
const autoRotateSpeed = 0.0005;
const dragSensitivity = 0.002;
const smoothingFactor = 0.05;

// Keep track of loading
let viewersLoadedCount = 0;
const totalViewers = Object.keys(viewers).length;

// Hotspot managers
const hotspotManagers = {
    club: null,
    etage: null
};

// HotspotManager class - simplified and fixed
class HotspotManager {
    constructor(location) {
        this.location = location;
        this.currentViewpoint = 1;
        this.hotspots = [];
        this.hotspotsVisible = true;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupInteraction();
    }

    setupInteraction() {
        const container = document.getElementById(`${this.location}-viewer`);
        
        container.addEventListener('click', (event) => {
            this.onContainerClick(event);
        });
        
        container.addEventListener('mousemove', (event) => {
            this.onContainerMouseMove(event);
        });
        
        // Touch events
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let touchMoved = false;
        
        container.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                touchStartTime = Date.now();
                touchStartPos.x = event.touches[0].clientX;
                touchStartPos.y = event.touches[0].clientY;
                touchMoved = false;
            }
        }, { passive: true });
        
        container.addEventListener('touchmove', (event) => {
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                const deltaX = Math.abs(touch.clientX - touchStartPos.x);
                const deltaY = Math.abs(touch.clientY - touchStartPos.y);
                
                if (deltaX > 10 || deltaY > 10) {
                    touchMoved = true;
                }
            }
        }, { passive: true });
        
        container.addEventListener('touchend', (event) => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (event.changedTouches.length === 1 && 
                touchDuration < 500 && 
                !touchMoved) {
                
                const touch = event.changedTouches[0];
                const syntheticEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {},
                    stopPropagation: () => {},
                };
                
                this.onContainerClick(syntheticEvent);
            }
        }, { passive: true });
    }

    loadHotspots(viewpointId) {
        this.currentViewpoint = viewpointId;
        this.clearHotspots();
        
        const viewpoint = viewpoints[this.location][viewpointId - 1];
        if (!viewpoint?.hotspots) return;
        
        viewpoint.hotspots.forEach(hotspotData => {
            this.createHotspot(hotspotData);
        });
    }

    createHotspot(hotspotData) {
        const viewer = viewers[this.location];
        const worldPosition = this.uvToWorldPosition(hotspotData.position);
        
        // Create hotspot group
        const hotspotGroup = new THREE.Group();
        
        // Main circle
        const circleGeometry = new THREE.CircleGeometry(32, 28);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: this.hotspotsVisible ? 0.85 : 0,
            depthWrite: false,
            depthTest: false
        });
        
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.renderOrder = 999;
        hotspotGroup.add(circle);
        
        // Shadow
        const shadowGeometry = new THREE.CircleGeometry(34, 30);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: this.hotspotsVisible ? 0.1 : 0,
            depthWrite: false,
            depthTest: false
        });
        
        const shadowCircle = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowCircle.position.z = -0.5;
        shadowCircle.renderOrder = 998;
        hotspotGroup.add(shadowCircle);
        
// Plus sign - using thick cylinders instead of thin lines
const lineThickness = 1.1;  // Adjust this for thickness
const lineLength = 24;    // Length of the lines
const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: this.hotspotsVisible ? 0.9 : 0
});

// Horizontal line (cylinder rotated)
const horizontalGeometry = new THREE.CylinderGeometry(lineThickness, lineThickness, lineLength, 8);
horizontalGeometry.rotateZ(Math.PI / 2); // Rotate to make it horizontal
const horizontalLine = new THREE.Mesh(horizontalGeometry, lineMaterial.clone());
horizontalLine.position.z = 0.1;

// Vertical line (cylinder)
const verticalGeometry = new THREE.CylinderGeometry(lineThickness, lineThickness, lineLength, 8);
const verticalLine = new THREE.Mesh(verticalGeometry, lineMaterial.clone());
verticalLine.position.z = 0.1;
        
        hotspotGroup.add(horizontalLine);
        hotspotGroup.add(verticalLine);
        
        // Position and orient
        hotspotGroup.position.copy(worldPosition);
        hotspotGroup.lookAt(0, 0, 0);
        
        // Store references
        hotspotGroup.userData = {
            target: hotspotData.target,
            id: hotspotData.id,
            isHotspot: true,
            circle: circle,
            shadowCircle: shadowCircle,
            horizontalLine: horizontalLine,
            verticalLine: verticalLine
        };
        
        viewer.sphere.add(hotspotGroup);
        this.hotspots.push(hotspotGroup);
    }

    uvToWorldPosition(uvPos) {
        const theta = (1 - uvPos.u) * Math.PI * 2;
        const phi = uvPos.v * Math.PI;
        const radius = 490;
        
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);
        
        return new THREE.Vector3(x, y, z);
    }

    onContainerClick(event) {
        if (viewers[this.location].isTransitioning) return;
        
        const container = document.getElementById(`${this.location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, viewers[this.location].camera);
        const intersects = this.raycaster.intersectObjects(this.hotspots, true);
        
        if (intersects.length > 0) {
            let clickedGroup = intersects[0].object;
            while (clickedGroup.parent && !clickedGroup.userData.isHotspot) {
                clickedGroup = clickedGroup.parent;
            }
            
            if (clickedGroup.userData.isHotspot) {
                // Stop camera movement immediately
                const viewer = viewers[this.location];
                viewer.targetRotationX = viewer.currentRotationX;
                viewer.targetRotationY = viewer.currentRotationY;
                
                this.onHotspotClick(clickedGroup.userData.target);
            }
        }
    }
    
    onContainerMouseMove(event) {
        const container = document.getElementById(`${this.location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, viewers[this.location].camera);
        const intersects = this.raycaster.intersectObjects(this.hotspots, true);
        
        // Reset all hotspots
this.hotspots.forEach(hotspotGroup => {
    hotspotGroup.scale.set(1, 1, 1);
    
    if (hotspotGroup.userData.circle) {
        hotspotGroup.userData.circle.material.color.setHex(0xffffff);
    }
    if (hotspotGroup.userData.horizontalLine) {
        hotspotGroup.userData.horizontalLine.material.color.setHex(0xffffff); // Now white
    }
    if (hotspotGroup.userData.verticalLine) {
        hotspotGroup.userData.verticalLine.material.color.setHex(0xffffff); // Now white
    }
});
        
        // Highlight hovered hotspot
        if (intersects.length > 0 && !('ontouchstart' in window)) {
            let hoveredGroup = intersects[0].object;
            while (hoveredGroup.parent && !hoveredGroup.userData.isHotspot) {
                hoveredGroup = hoveredGroup.parent;
            }
            
            if (hoveredGroup.userData.isHotspot) {
                hoveredGroup.scale.set(1.05, 1.05, 1.05);
                
                if (hoveredGroup.userData.circle) {
                    hoveredGroup.userData.circle.material.color.setHex(0xebd55a);
                }
if (hoveredGroup.userData.horizontalLine) {
    hoveredGroup.userData.horizontalLine.material.color.setHex(0xffffff);
}
if (hoveredGroup.userData.verticalLine) {
    hoveredGroup.userData.verticalLine.material.color.setHex(0xffffff);
}
                
                container.style.cursor = 'pointer';
            }
        } else {
            container.style.cursor = 'move';
        }
    }

    clearHotspots() {
        const viewer = viewers[this.location];
        
        this.hotspots.forEach(hotspotGroup => {
            viewer.sphere.remove(hotspotGroup);
            
            hotspotGroup.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            });
        });
        
        this.hotspots = [];
    }

    onHotspotClick(targetViewpoint) {
        if (viewers[this.location].isTransitioning) return;
        switchViewpoint(this.location, targetViewpoint);
    }

    setVisibility(visible, duration = 400) {
        this.hotspotsVisible = visible;
        const targetOpacity = visible ? 1 : 0;
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentOpacity = visible ? progress : 1 - progress;
            
            this.hotspots.forEach(hotspotGroup => {
                if (hotspotGroup.userData.circle) {
                    hotspotGroup.userData.circle.material.opacity = 0.85 * currentOpacity;
                }
                if (hotspotGroup.userData.shadowCircle) {
                    hotspotGroup.userData.shadowCircle.material.opacity = 0.1 * currentOpacity;
                }
                if (hotspotGroup.userData.horizontalLine) {
                    hotspotGroup.userData.horizontalLine.material.opacity = 0.9 * currentOpacity;
                }
                if (hotspotGroup.userData.verticalLine) {
                    hotspotGroup.userData.verticalLine.material.opacity = 0.9 * currentOpacity;
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hotspot managers
    hotspotManagers.club = new HotspotManager('club');
    hotspotManagers.etage = new HotspotManager('etage');
    
    // Initialize viewers
    initViewer('club');
    initViewer('etage');
    
    // Start animation loop
    animate();
    
    // Load initial viewpoints
    loadViewpoint('club', 1, true); 
    loadViewpoint('etage', 1, true);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        let activeFullscreenViewerLocation = null;
        for (const loc in viewers) {
            if (viewers[loc].isFullscreen) {
                activeFullscreenViewerLocation = loc;
                break;
            }
        }

        if (activeFullscreenViewerLocation) {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    toggleAutoRotate(activeFullscreenViewerLocation);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevViewpoint(activeFullscreenViewerLocation);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextViewpoint(activeFullscreenViewerLocation);
                    break;
                case 'Escape':
                    e.preventDefault();
                    exitFullscreen();
                    break;
            }
        } else if (e.key === 'Escape') {
            exitFullscreen();
        }
    });
});

// Initialize viewer
function initViewer(location) {
    const container = document.getElementById(`${location}-viewer`);
    const viewer = viewers[location];

    // Scene
    viewer.scene = new THREE.Scene();

    // Camera
    viewer.camera = new THREE.PerspectiveCamera(
        70, 
        container.clientWidth / container.clientHeight, 
        1,
        1000
    );
    viewer.camera.position.set(0, 0, 0.1);

    // Renderer
    viewer.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    viewer.renderer.setSize(container.clientWidth, container.clientHeight);
    viewer.renderer.sortObjects = false;
    container.appendChild(viewer.renderer.domElement);

    // Sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({
        map: null,
        side: THREE.FrontSide
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

// Animation loop - simplified and fixed
function animate() {
    requestAnimationFrame(animate);
    
    ['club', 'etage'].forEach(location => {
        const viewer = viewers[location];
        
        if (!viewer.sphere || !viewer.camera || !viewer.renderer) return;
        
        // Auto-rotation
        if (viewer.isAutoRotating && !viewer.isUserInteracting && !viewer.isTransitioning) {
            viewer.targetRotationX += autoRotateSpeed;
        }
        
        // Smooth rotation updates
        viewer.currentRotationX += (viewer.targetRotationX - viewer.currentRotationX) * smoothingFactor;
        viewer.currentRotationY += (viewer.targetRotationY - viewer.currentRotationY) * smoothingFactor;
        
        // Apply rotation to sphere
        viewer.sphere.rotation.y = viewer.currentRotationX;
        
        // Update camera position
        const phi = Math.PI/2 - viewer.currentRotationY;
        const theta = viewer.currentRotationX;
        
        const radius = 100;
        viewer.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        viewer.camera.position.y = radius * Math.cos(phi);
        viewer.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        
        viewer.camera.lookAt(0, 0, 0);
        
        // Render
        viewer.renderer.render(viewer.scene, viewer.camera);
    });
}

// Navigation UI update
function updateNavigation(location) {
    const viewer = viewers[location];
    
    // Update viewpoint buttons
    const allViewpointButtons = document.querySelectorAll(`[id^="${location}-"]:not([id$="rotate-button"]):not([id$="fullscreen-icon"]):not([id$="fullscreen-nav"])`);
    allViewpointButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeButtons = document.querySelectorAll(`#${location}-${viewer.currentViewpoint}, #${location}-fs-${viewer.currentViewpoint}`);
    activeButtons.forEach(btn => {
        btn.classList.add('active');
    });
    
    // Update rotate buttons
    const rotateButtons = document.querySelectorAll(`#${location}-rotate-button, #${location}-fs-rotate-button`);
    rotateButtons.forEach(btn => {
        btn.classList.toggle('active', viewer.isAutoRotating);
    });
}

// Navigation functions
function switchViewpoint(location, id) {
    const viewer = viewers[location];
    if (viewer.isTransitioning && viewer.currentViewpoint === id) return;
    
    viewer.currentViewpoint = id;
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

// Load viewpoint - simplified and fixed
async function loadViewpoint(location, id, isInitial = false) {
    const viewer = viewers[location];
    const wasAutoRotating = viewer.isAutoRotating;
    
    viewer.isTransitioning = true;
    stopAutoRotate(location);
    
    const viewpoint = viewpoints[location][id - 1];
    const container = document.getElementById(`${location}-viewer`);
    
    // Hide hotspots before transition
    if (hotspotManagers[location] && !isInitial) {
        hotspotManagers[location].setVisibility(false, 300);
    }
    
    // Fade out current view
    if (!isInitial) {
        container.style.opacity = '0';
    }
    
    // Load texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    
    loader.load(
        viewpoint.panorama,
        (texture) => {
            setTimeout(() => {
                // Configure texture
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                // Replace sphere material
                if (viewer.sphere.material) {
                    viewer.sphere.material.dispose();
                }
                viewer.sphere.material = new THREE.MeshBasicMaterial({ 
                    map: texture
                });
                
                // Set starting camera position
                if (viewpoint.startX !== undefined) {
                    const startXRadians = (viewpoint.startX * Math.PI) / 180;
                    viewer.targetRotationX = startXRadians;
                    viewer.currentRotationX = startXRadians;
                    viewer.sphere.rotation.y = startXRadians;
                }
                if (viewpoint.startY !== undefined) {
                    const startYRadians = (viewpoint.startY * Math.PI) / 180;
                    viewer.targetRotationY = startYRadians;
                    viewer.currentRotationY = startYRadians;
                }
                
                // Clear old hotspots and load new ones
                if (hotspotManagers[location]) {
                    hotspotManagers[location].loadHotspots(id);
                }
                
                // Show viewer
                container.style.opacity = '1';
                
                // Complete transition
                setTimeout(() => {
                    viewer.isTransitioning = false;
                    if (wasAutoRotating || isInitial) {
                        startAutoRotate(location);
                    }
                    updateNavigation(location);
                    
                    // Show hotspots
                    if (hotspotManagers[location]) {
                        hotspotManagers[location].setVisibility(true, 400);
                    }
                    
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
                }, 800);
                
            }, isInitial ? 0 : 800);
        },
        (xhr) => {
            // Progress callback
        },
        (error) => {
            console.error('Error loading panorama:', error);
            viewer.isTransitioning = false;
            
            if (viewer.sphere && viewer.sphere.material) {
                viewer.sphere.material.dispose();
                viewer.sphere.material = new THREE.MeshBasicMaterial({ 
                    color: 0x333333
                });
            }
            container.style.opacity = '1';
            updateNavigation(location);
            
            if (wasAutoRotating) {
                startAutoRotate(location);
            }
            
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

// Positioning Mode System (for development)
const PositioningMode = {
    enabled: false,
    overlay: null,
    mouseHandlers: new Map(),

    init() {
        this.createOverlay();
        this.setupKeyboardToggle();
        console.log('Positioning system initialized. Press P to toggle.');
    },

    createOverlay() {
        if (this.overlay) return;

        this.overlay = document.createElement('div');
        this.overlay.id = 'positioning-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            display: none;
        `;

        this.overlay.innerHTML = `
            <div>Positioning Mode: <span id="pos-status">OFF</span></div>
            <div>Location: <span id="pos-location">-</span></div>
            <div>Viewpoint: <span id="pos-viewpoint">-</span></div>
            <div>UV: <span id="pos-coords">-</span></div>
            <button id="pos-copy" style="margin-top: 8px; padding: 4px 8px; font-size: 11px;">Copy Config</button>
            <div style="font-size: 10px; margin-top: 8px; opacity: 0.7;">Press P to toggle</div>
        `;

        document.body.appendChild(this.overlay);

        document.getElementById('pos-copy').addEventListener('click', () => {
            const coords = document.getElementById('pos-coords').textContent;
            if (coords !== '-') {
                const [u, v] = coords.split(', ');
                const config = `{ id: 'hotspot_X', target: X, position: { u: ${u}, v: ${v} } }`;
                navigator.clipboard.writeText(config).then(() => {
                    console.log('Hotspot config copied to clipboard:', config);
                });
            }
        });
    },

    setupKeyboardToggle() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    toggle() {
        this.enabled = !this.enabled;
        console.log(`Positioning mode: ${this.enabled ? 'ON' : 'OFF'}`);
        
        if (this.enabled) {
            this.enable();
        } else {
            this.disable();
        }
    },

    enable() {
        this.overlay.style.display = 'block';
        document.getElementById('pos-status').textContent = 'ON';
        
        ['club', 'etage'].forEach(location => {
            const container = document.getElementById(`${location}-viewer`);
            const canvas = container ? container.querySelector('canvas') : null;
            
            if (canvas) {
                const handler = (event) => this.handleClick(event, location);
                this.mouseHandlers.set(location, handler);
                canvas.addEventListener('mousedown', handler);
                
                container.style.cursor = 'crosshair';
                canvas.style.cursor = 'crosshair';
            }
        });
        
        console.log('Click on viewers to get coordinates. Press P to toggle off.');
    },

    disable() {
        this.overlay.style.display = 'none';
        
        ['club', 'etage'].forEach(location => {
            const container = document.getElementById(`${location}-viewer`);
            const canvas = container ? container.querySelector('canvas') : null;
            
            if (canvas) {
                const handler = this.mouseHandlers.get(location);
                if (handler) {
                    canvas.removeEventListener('mousedown', handler);
                    this.mouseHandlers.delete(location);
                }
                
                container.style.cursor = 'move';
                canvas.style.cursor = 'move';
            }
        });
        
        document.getElementById('pos-location').textContent = '-';
        document.getElementById('pos-viewpoint').textContent = '-';
        document.getElementById('pos-coords').textContent = '-';
    },

    handleClick(event, location) {
        console.log('=== POSITIONING CLICK ===');
        event.preventDefault();
        event.stopPropagation();
        
        const viewer = viewers[location];
        if (!viewer) {
            console.error('Viewer not found:', location);
            return;
        }
        
        const container = document.getElementById(`${location}-viewer`);
        const rect = container.getBoundingClientRect();
        const currentViewpoint = viewer.currentViewpoint;
        
        document.getElementById('pos-location').textContent = location;
        document.getElementById('pos-viewpoint').textContent = currentViewpoint;
        
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, viewer.camera);
        const intersects = raycaster.intersectObjects([viewer.sphere]);
        
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const uvPos = this.worldPositionToUV(intersectionPoint);
            
            const uFormatted = uvPos.u.toFixed(3);
            const vFormatted = uvPos.v.toFixed(3);
            
            document.getElementById('pos-coords').textContent = `${uFormatted}, ${vFormatted}`;
            
            console.log(`Location: ${location}, Viewpoint: ${currentViewpoint}`);
            console.log(`UV coordinates: u: ${uFormatted}, v: ${vFormatted}`);
            console.log(`Config: { id: 'hotspot_X', target: X, position: { u: ${uFormatted}, v: ${vFormatted} } }`);
        } else {
            console.log('No intersection found');
            document.getElementById('pos-coords').textContent = 'No intersection';
        }
    },

    worldPositionToUV(worldPos) {
        const dir = worldPos.clone().normalize();
        const phi = Math.acos(dir.y);
        let theta = Math.atan2(dir.x, dir.z);
        
        if (theta < 0) theta += Math.PI * 2;
        
        const u = 1 - (theta / (Math.PI * 2));
        const v = phi / Math.PI;
        
        return { u, v };
    }
};

// Initialize positioning system
document.addEventListener('DOMContentLoaded', () => {
    PositioningMode.init();
});