// Configuration for viewpoints with UV texture coordinate hotspots
// Hotspot positions use UV coordinates (0-1 range on texture)
// u: horizontal position on texture (0 = left edge, 1 = right edge)
// v: vertical position on texture (0 = top edge, 1 = bottom edge)
const viewpoints = {
    club: [
        { 
            id: 1, 
            panorama: "https://assets.360.petsq.works/w70_2/club_001.jpg",
            startX: -15,     // Horizontal rotation (degrees: 0 = front, 90 = right, 180 = back, -90 = left)
            startY: 15,      // Vertical rotation (degrees: 0 = center, 30 = up, -30 = down)
            hotspots: [
                { id: 'to_2', target: 2, position: { u: 0.625, v: 0.5 } },
                { id: 'to_3', target: 3, position: { u: 0.208, v: 0.6 } },
                { id: 'to_5', target: 5, position: { u: 0.5, v: 0.3 } }
            ]
        },
        { 
            id: 2, 
            panorama: "https://assets.360.petsq.works/w70_2/club_002.jpg",
            startX: -20,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.125, v: 0.5 } },
                { id: 'to_3', target: 3, position: { u: 0.667, v: 0.65 } },
                { id: 'to_4', target: 4, position: { u: 0.583, v: 0.7 } }
            ]
        },
        { 
            id: 3, 
            panorama: "https://assets.360.petsq.works/w70_2/club_003.jpg",
            startX: 50,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.625, v: 0.5 } },
                { id: 'to_2', target: 2, position: { u: 0.292, v: 0.6 } },
                { id: 'to_4', target: 4, position: { u: 1.0, v: 0.5 } }
            ]
        },
        { 
            id: 4, 
            panorama: "https://assets.360.petsq.works/w70_2/club_004.jpg",
            startX: -60,
            startY: 15,
            hotspots: [
                { id: 'to_2', target: 2, position: { u: 0.5, v: 0.35 } },
                { id: 'to_3', target: 3, position: { u: 0.125, v: 0.5 } },
                { id: 'to_5', target: 5, position: { u: 0.625, v: 0.7 } }
            ]
        },
        { 
            id: 5, 
            panorama: "https://assets.360.petsq.works/w70_2/club_005.jpg",
            startX: -50,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.5, v: 0.75 } },
                { id: 'to_4', target: 4, position: { u: 0.125, v: 0.4 } }
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
                { id: 'to_2', target: 2, position: { u: 0.625, v: 0.5 } },
                { id: 'to_3', target: 3, position: { u: 0.292, v: 0.6 } },
                { id: 'to_5', target: 5, position: { u: 0.708, v: 0.35 } }
            ]
        },
        { 
            id: 2, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_01.jpg",
            startX: 70,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.042, v: 0.5 } },
                { id: 'to_3', target: 3, position: { u: 0.625, v: 0.65 } },
                { id: 'to_4', target: 4, position: { u: 0.5, v: 0.7 } }
            ]
        },
        { 
            id: 3, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_03.jpg",
            startX: -10,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.625, v: 0.5 } },
                { id: 'to_2', target: 2, position: { u: 0.208, v: 0.6 } },
                { id: 'to_4', target: 4, position: { u: 1.0, v: 0.5 } }
            ]
        },
        { 
            id: 4, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_04.jpg",
            startX: -90,
            startY: 15,
            hotspots: [
                { id: 'to_2', target: 2, position: { u: 0.5, v: 0.3 } },
                { id: 'to_3', target: 3, position: { u: 0.125, v: 0.5 } },
                { id: 'to_5', target: 5, position: { u: 0.625, v: 0.65 } }
            ]
        },
        { 
            id: 5, 
            panorama: "https://assets.360.petsq.works/w70_2/etage_05.jpg",
            startX: -20,
            startY: 15,
            hotspots: [
                { id: 'to_1', target: 1, position: { u: 0.292, v: 0.75 } },
                { id: 'to_4', target: 4, position: { u: 0.125, v: 0.4 } }
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

// Hotspot overlay managers
const hotspotManagers = {
    club: null,
    etage: null
};

// HotspotManager class for managing 3D mesh-based glassmorphism navigation hotspots
class HotspotManager {
    constructor(location) {
        this.location = location;
        this.currentViewpoint = 1;
        this.hotspots = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup interaction listeners
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
    }

    loadHotspots(viewpointId) {
        this.currentViewpoint = viewpointId;
        this.clearHotspots();
        
        const viewpoint = viewpoints[this.location][viewpointId - 1];
        if (!viewpoint?.hotspots) return;
        
        viewpoint.hotspots.forEach(hotspotData => {
            this.create3DHotspot(hotspotData);
        });
    }

    create3DHotspot(hotspotData) {
    const viewer = viewers[this.location];
    
    // Convert UV coordinates to 3D world position
    const worldPosition = this.uvToWorldPosition(hotspotData.position);
    
    // Create hotspot geometry - much smaller for crisp rendering
    const geometry = new THREE.PlaneGeometry(30, 30);
    
    // Skip canvas entirely - use a solid color material first
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true
    });
    
    // Create mesh
    const hotspotMesh = new THREE.Mesh(geometry, material);
    
    // Add hotspot as child of sphere
    viewer.sphere.add(hotspotMesh);
    
    // Position relative to sphere
    hotspotMesh.position.copy(worldPosition);
    
    // Make hotspot face the center
    hotspotMesh.lookAt(0, 0, 0);
    
    // Add a border ring using Line geometry for crisp edges
    const ringGeometry = new THREE.RingGeometry(14, 16, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    hotspotMesh.add(ringMesh);
    
    // Add center dot
    const dotGeometry = new THREE.CircleGeometry(3, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0x372d73,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial);
    dotMesh.position.z = 0.1; // Slightly forward
    hotspotMesh.add(dotMesh);
    
    // Store hotspot data
    hotspotMesh.userData = {
        target: hotspotData.target,
        id: hotspotData.id,
        uvPosition: hotspotData.position,
        isHotspot: true,
        ringMesh: ringMesh,
        dotMesh: dotMesh
    };
    
    // Store reference
    this.hotspots.push(hotspotMesh);
}

    drawSimpleHotspot(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width * 0.35;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Create clean circle with crisp edges
        ctx.save();
        
        // Main circle with solid color and clean edges
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // Simple white background with slight transparency
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Clean border
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Simple arrow icon in center
        const arrowSize = radius * 0.4;
        ctx.strokeStyle = 'rgba(55, 45, 115, 0.8)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(centerX - arrowSize/2, centerY);
        ctx.lineTo(centerX + arrowSize/2, centerY);
        ctx.moveTo(centerX + arrowSize/4, centerY - arrowSize/3);
        ctx.lineTo(centerX + arrowSize/2, centerY);
        ctx.lineTo(centerX + arrowSize/4, centerY + arrowSize/3);
        ctx.stroke();
        
        ctx.restore();
    }

    drawSimpleHotspotHover(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width * 0.35;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Create hover state with subtle changes
        ctx.save();
        
        // Main circle with hover color
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // Slightly different color for hover
        ctx.fillStyle = 'rgba(235, 213, 90, 0.95)';
        ctx.fill();
        
        // Enhanced border for hover
        ctx.strokeStyle = 'rgba(235, 213, 90, 1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Arrow with accent color
        const arrowSize = radius * 0.4;
        ctx.strokeStyle = 'rgba(55, 45, 115, 1)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(centerX - arrowSize/2, centerY);
        ctx.lineTo(centerX + arrowSize/2, centerY);
        ctx.moveTo(centerX + arrowSize/4, centerY - arrowSize/3);
        ctx.lineTo(centerX + arrowSize/2, centerY);
        ctx.lineTo(centerX + arrowSize/4, centerY + arrowSize/3);
        ctx.stroke();
        
        ctx.restore();
    }

    drawGlassmorphismHotspot(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42; // Larger base size
    
    // Clear canvas with subtle gradient background
    ctx.clearRect(0, 0, width, height);
    
    // Create a very subtle radial gradient for depth
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Main glass panel - ultra clean frosted glass
    ctx.save();
    
    // Soft shadow for floating effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 10;
    
    // Main glass circle
    const glassGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.88)');
    glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.82)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = glassGradient;
    ctx.fill();
    
    ctx.restore();
    
    // Ultra-thin border with gradient
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
    borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Nordic light reflection - very subtle
    const lightGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, 
        centerY - radius * 0.3, 
        0,
        centerX - radius * 0.3, 
        centerY - radius * 0.3, 
        radius * 0.6
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = lightGradient;
    ctx.fill();
    
    // Center icon - minimal arrow or dot
    ctx.save();
    
    // Arrow pointing right (minimal, geometric)
    const arrowSize = radius * 0.3;
    const arrowX = centerX;
    const arrowY = centerY;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw minimal arrow
    ctx.beginPath();
    ctx.moveTo(arrowX - arrowSize/2, arrowY);
    ctx.lineTo(arrowX + arrowSize/2, arrowY);
    ctx.moveTo(arrowX + arrowSize/4, arrowY - arrowSize/3);
    ctx.lineTo(arrowX + arrowSize/2, arrowY);
    ctx.lineTo(arrowX + arrowSize/4, arrowY + arrowSize/3);
    ctx.stroke();
    
    ctx.restore();
    
    // Subtle inner shadow for depth
    const innerShadowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius);
    innerShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerShadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = innerShadowGradient;
    ctx.fill();
}


drawHoverGlassmorphismHotspot(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.42;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Hover state - subtle scale and glow
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.8);
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    bgGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.save();
    
    // Enhanced shadow for lifted effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 15;
    
    // Main glass with subtle color shift
    const glassGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.94)');
    glassGradient.addColorStop(1, 'rgba(250, 250, 255, 0.88)'); // Slight blue tint
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = glassGradient;
    ctx.fill();
    
    ctx.restore();
    
    // Animated border
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    borderGradient.addColorStop(0.5, 'rgba(230, 230, 255, 0.9)');
    borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Enhanced light reflection
    const lightGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, 
        centerY - radius * 0.3, 
        0,
        centerX - radius * 0.3, 
        centerY - radius * 0.3, 
        radius * 0.7
    );
    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = lightGradient;
    ctx.fill();
    
    // Arrow with accent color on hover
    ctx.save();
    
    const arrowSize = radius * 0.3;
    const arrowX = centerX;
    const arrowY = centerY;
    
    // Arrow gets accent color
    ctx.strokeStyle = 'rgba(70, 70, 255, 0.6)'; // Subtle blue
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(arrowX - arrowSize/2, arrowY);
    ctx.lineTo(arrowX + arrowSize/2, arrowY);
    ctx.moveTo(arrowX + arrowSize/4, arrowY - arrowSize/3);
    ctx.lineTo(arrowX + arrowSize/2, arrowY);
    ctx.lineTo(arrowX + arrowSize/4, arrowY + arrowSize/3);
    ctx.stroke();
    
    ctx.restore();
    
    // Subtle pulse ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

    uvToWorldPosition(uvPos) {
        // For an inverted sphere (scale -1, 1, 1), the texture mapping is:
        // - The sphere is turned inside-out, so we see the texture from inside
        // - U coordinate: 0 = left edge of texture, 1 = right edge
        // - V coordinate: 0 = top, 1 = bottom
        // - When sphere.rotation.y = 0, we're looking at U = 0.5
        
        // Convert UV to spherical coordinates
        // U maps to azimuth (horizontal angle), but reversed due to inversion
        const theta = (1 - uvPos.u) * Math.PI * 2; // Reverse U for inverted sphere
        
        // V maps to elevation (vertical angle from top)
        const phi = uvPos.v * Math.PI; // 0 at top, π at bottom
        
        // Position just inside the sphere to avoid z-fighting
        const radius = 499;
        
        // Convert spherical to Cartesian (Y-up coordinate system)
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);
        
        console.log(`UV(${uvPos.u.toFixed(3)}, ${uvPos.v.toFixed(3)}) -> World(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
        
        return new THREE.Vector3(x, y, z);
    }

    onContainerClick(event) {
        if (viewers[this.location].isTransitioning) return;
        
        const container = document.getElementById(`${this.location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse, viewers[this.location].camera);
        
        // Check for intersections with hotspots
        const intersects = this.raycaster.intersectObjects(this.hotspots);
        
        if (intersects.length > 0) {
            const clickedHotspot = intersects[0].object;
            if (clickedHotspot.userData.isHotspot) {
                this.onHotspotClick(clickedHotspot.userData.target);
            }
        }
    }
    
    onContainerMouseMove(event) {
        const container = document.getElementById(`${this.location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Cast ray for hover effects
        this.raycaster.setFromCamera(this.mouse, viewers[this.location].camera);
        const intersects = this.raycaster.intersectObjects(this.hotspots);
        
        // Reset all hotspots to normal state
        this.hotspots.forEach(hotspot => {
            hotspot.scale.set(1, 1, 1);
            hotspot.material.color.setHex(0xffffff);
            hotspot.material.opacity = 0.9;
            if (hotspot.userData.ringMesh) {
                hotspot.userData.ringMesh.material.color.setHex(0xffffff);
            }
            if (hotspot.userData.dotMesh) {
                hotspot.userData.dotMesh.material.color.setHex(0x372d73);
            }
        });
        
        // Highlight hovered hotspot
        if (intersects.length > 0) {
            const hoveredHotspot = intersects[0].object;
            if (hoveredHotspot.userData.isHotspot) {
                // Apply hover effects with color changes
                hoveredHotspot.scale.set(1.15, 1.15, 1.15);
                hoveredHotspot.material.color.setHex(0xebd55a); // Your brand yellow
                hoveredHotspot.material.opacity = 0.95;
                if (hoveredHotspot.userData.ringMesh) {
                    hoveredHotspot.userData.ringMesh.material.color.setHex(0xebd55a);
                }
                if (hoveredHotspot.userData.dotMesh) {
                    hoveredHotspot.userData.dotMesh.material.color.setHex(0x372d73);
                }
                container.style.cursor = 'pointer';
            }
        } else {
            container.style.cursor = 'move';
        }
    }

    clearHotspots() {
        const viewer = viewers[this.location];
        
        // Remove from sphere (not scene!)
        this.hotspots.forEach(hotspot => {
            viewer.sphere.remove(hotspot);
            
            // Dispose of geometry and material
            if (hotspot.geometry) hotspot.geometry.dispose();
            if (hotspot.material) {
                if (hotspot.material.map) hotspot.material.map.dispose();
                hotspot.material.dispose();
            }
        });
        
        this.hotspots = [];
    }

    onHotspotClick(targetViewpoint) {
        if (viewers[this.location].isTransitioning) return;
        switchViewpoint(this.location, targetViewpoint);
    }

    hide() {
        this.hotspots.forEach(hotspot => {
            hotspot.visible = false;
        });
    }

    show() {
        this.hotspots.forEach(hotspot => {
            hotspot.visible = true;
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hotspot managers
    hotspotManagers.club = new HotspotManager('club');
    hotspotManagers.etage = new HotspotManager('etage');
    
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

    // Renderer with enhanced precision
    viewer.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance'
    });
    viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
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
        
        // Hotspots are now 3D objects, no manual position updates needed
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
                
                // Set starting camera position from viewpoint configuration (convert degrees to radians)
                if (viewpoint.startX !== undefined) {
                    const startXRadians = (viewpoint.startX * Math.PI) / 180;
                    viewer.targetRotationX = startXRadians;
                    // Set sphere rotation immediately to avoid visual glitch
                    viewer.sphere.rotation.y = startXRadians;
                }
                if (viewpoint.startY !== undefined) {
                    const startYRadians = (viewpoint.startY * Math.PI) / 180;
                    viewer.targetRotationY = startYRadians;
                }
                
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
                    
                    // Load hotspots for the new viewpoint
                    if (hotspotManagers[location]) {
                        hotspotManagers[location].loadHotspots(id);
                    }

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
            
            // Load hotspots even on error to maintain consistent state
            if (hotspotManagers[location]) {
                hotspotManagers[location].loadHotspots(id);
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

// Developer positioning tools (set DEV_MODE = true to enable)
const DEV_MODE = true; // Enable dev mode to help position hotspots

if (DEV_MODE) {
    let positioningMode = false;
    
    // Add development mode toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === 'P' && e.ctrlKey) {
            e.preventDefault();
            positioningMode = !positioningMode;
            togglePositioningMode();
        }
    });
    
    function togglePositioningMode() {
        const containers = document.querySelectorAll('.viewer-container');
        containers.forEach(container => {
            if (positioningMode) {
                container.style.cursor = 'crosshair';
                container.addEventListener('click', onPositioningClick);
            } else {
                container.style.cursor = 'move';
                container.removeEventListener('click', onPositioningClick);
            }
        });
        
        console.log(`Positioning mode: ${positioningMode ? 'ON' : 'OFF'}`);
        if (positioningMode) {
            console.log('Click on viewers to get coordinates. Ctrl+P to toggle off.');
        }
    }
    
    function onPositioningClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const location = e.target.id.includes('club') ? 'club' : 'etage';
        const viewer = viewers[location];
        const currentViewpoint = viewer.currentViewpoint;
        
        // Get click position relative to viewer
        const container = document.getElementById(`${location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position in normalized device coordinates
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        // Cast ray from camera through mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, viewer.camera);
        
        // Intersect with the panorama sphere
        const intersects = raycaster.intersectObjects([viewer.sphere]);
        
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            
            // Convert 3D world position back to UV coordinates
            const uvPos = worldPositionToUV(intersectionPoint);
            
            const uFormatted = uvPos.u.toFixed(3);
            const vFormatted = uvPos.v.toFixed(3);
            
            console.log(`Location: ${location}, Viewpoint: ${currentViewpoint}`);
            console.log(`Click position: ${(e.clientX - rect.left).toFixed(0)}, ${(e.clientY - rect.top).toFixed(0)}`);
            console.log(`UV coordinates: u: ${uFormatted}, v: ${vFormatted}`);
            console.log(`Hotspot config: { id: 'to_X', target: X, position: { u: ${uFormatted}, v: ${vFormatted} } }`);
        }
    }
    
    function worldPositionToUV(worldPos) {
        // Normalize to get direction
        const dir = worldPos.clone().normalize();
        
        // Convert to spherical coordinates
        const phi = Math.acos(dir.y); // 0 to π
        let theta = Math.atan2(dir.x, dir.z); // -π to π
        
        // Normalize theta to 0-2π
        if (theta < 0) theta += Math.PI * 2;
        
        // For inverted sphere, reverse the U coordinate
        const u = 1 - (theta / (Math.PI * 2));
        const v = phi / Math.PI;
        
        return { u, v };
    }
    
    console.log('Developer mode enabled. Press Ctrl+P to toggle positioning mode.');
}