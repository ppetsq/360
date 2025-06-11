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

// Performance tracking for adaptive rendering
let lastFrameTime = 0;
let frameCount = 0;
let avgFrameTime = 16.67; // Target 60fps

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
        
        // Mouse events for desktop
        container.addEventListener('click', (event) => {
            this.onContainerClick(event);
        });
        
        container.addEventListener('mousemove', (event) => {
            this.onContainerMouseMove(event);
        });
        
        // Touch events for mobile
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
                
                // Consider it moved if touch moved more than 10 pixels
                if (deltaX > 10 || deltaY > 10) {
                    touchMoved = true;
                }
            }
        }, { passive: true });
        
        container.addEventListener('touchend', (event) => {
            const touchDuration = Date.now() - touchStartTime;
            
            // Only treat as tap if: single touch, short duration, minimal movement
            if (event.changedTouches.length === 1 && 
                touchDuration < 500 && 
                !touchMoved) {
                
                // Create a synthetic click event for hotspot detection
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

    loadHotspots(viewpointId, startVisible = true) {
        this.currentViewpoint = viewpointId;
        this.clearHotspots();
        
        const viewpoint = viewpoints[this.location][viewpointId - 1];
        if (!viewpoint?.hotspots) return;
        
        viewpoint.hotspots.forEach(hotspotData => {
            this.create3DHotspot(hotspotData, startVisible);
        });
    }

    create3DHotspot(hotspotData, startVisible = true) {
        const viewer = viewers[this.location];
        
        // Convert UV coordinates to 3D world position
        const worldPosition = this.uvToWorldPosition(hotspotData.position);
        
        // Create container group for the hotspot
        const hotspotGroup = new THREE.Group();
        
        // Always create with normal opacity values, but set group visibility
        const circleGeometry = new THREE.CircleGeometry(36, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
        });
        
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.frustumCulled = false;
        hotspotGroup.add(circle);
        
        // Subtle shadow circle behind main circle (lightweight shadow effect)
        const shadowGeometry = new THREE.CircleGeometry(38, 32);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.1,
        });
        
        const shadowCircle = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowCircle.position.z = -0.5; // Slightly behind main circle
        shadowCircle.frustumCulled = false;
        hotspotGroup.add(shadowCircle);
        
        // Clean plus sign with subtle transparency
        const plusSize = 18;
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x333333, // Slightly softer than pure black
            transparent: true,
            opacity: 0.9
        });
        
        const horizontalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-plusSize, 0, 0.1),
                new THREE.Vector3(plusSize, 0, 0.1)
            ]), 
            lineMaterial
        );
        horizontalLine.frustumCulled = false;
        
        const verticalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -plusSize, 0.1),
                new THREE.Vector3(0, plusSize, 0.1)
            ]), 
            lineMaterial
        );
        verticalLine.frustumCulled = false;
        
        hotspotGroup.add(horizontalLine);
        hotspotGroup.add(verticalLine);
        
        // Position the group
        hotspotGroup.position.copy(worldPosition);
        hotspotGroup.lookAt(0, 0, 0);
        
        // Set initial visibility by controlling the whole group
        hotspotGroup.visible = startVisible;
        
        // Add to sphere
        viewer.sphere.add(hotspotGroup);
        
        // Performance optimizations with anti-clipping measures
        hotspotGroup.renderOrder = 1;
        hotspotGroup.matrixAutoUpdate = true;
        hotspotGroup.frustumCulled = false;
        
        // Store references for interaction
        hotspotGroup.userData = {
            target: hotspotData.target,
            id: hotspotData.id,
            uvPosition: hotspotData.position,
            isHotspot: true,
            circle: circle,
            shadowCircle: shadowCircle,
            horizontalLine: horizontalLine,
            verticalLine: verticalLine
        };
        
        // Store reference
        this.hotspots.push(hotspotGroup);
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
        
        // Position further inside the sphere to avoid clipping issues
        const radius = 490;
        
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
        
        // Check for intersections with hotspots (recursive for groups)
        const intersects = this.raycaster.intersectObjects(this.hotspots, true);
        
        if (intersects.length > 0) {
            // Find the parent group of the clicked object
            let clickedGroup = intersects[0].object;
            while (clickedGroup.parent && !clickedGroup.userData.isHotspot) {
                clickedGroup = clickedGroup.parent;
            }
            
            if (clickedGroup.userData.isHotspot) {
                this.onHotspotClick(clickedGroup.userData.target);
            }
        }
    }
    
    onContainerMouseMove(event) {
        const container = document.getElementById(`${this.location}-viewer`);
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Cast ray for hover effects - need to check all children since we're using groups
        this.raycaster.setFromCamera(this.mouse, viewers[this.location].camera);
        const intersects = this.raycaster.intersectObjects(this.hotspots, true); // recursive = true for groups
        
        // Reset all hotspots to normal state
        this.hotspots.forEach(hotspotGroup => {
            // Reset group scale
            hotspotGroup.scale.set(1, 1, 1);
            
            // Reset circle color and opacity
            if (hotspotGroup.userData.circle) {
                hotspotGroup.userData.circle.material.color.setHex(0xffffff);
                hotspotGroup.userData.circle.material.opacity = 0.85;
            }
            
            // Reset shadow opacity
            if (hotspotGroup.userData.shadowCircle) {
                hotspotGroup.userData.shadowCircle.material.opacity = 0.1;
            }
            
            // Reset plus sign color
            if (hotspotGroup.userData.horizontalLine) {
                hotspotGroup.userData.horizontalLine.material.color.setHex(0x333333);
                hotspotGroup.userData.horizontalLine.material.opacity = 0.9;
            }
            if (hotspotGroup.userData.verticalLine) {
                hotspotGroup.userData.verticalLine.material.color.setHex(0x333333);
                hotspotGroup.userData.verticalLine.material.opacity = 0.9;
            }
        });
        
        // Highlight hovered hotspot (only on non-touch devices)
        if (intersects.length > 0 && !('ontouchstart' in window)) {
            // Find the parent group of the intersected object
            let hoveredGroup = intersects[0].object;
            while (hoveredGroup.parent && !hoveredGroup.userData.isHotspot) {
                hoveredGroup = hoveredGroup.parent;
            }
            
            if (hoveredGroup.userData.isHotspot) {
                // Apply subtle hover effects
                hoveredGroup.scale.set(1.05, 1.05, 1.05);
                
                // Slight color change and increased opacity on hover
                if (hoveredGroup.userData.circle) {
                    hoveredGroup.userData.circle.material.color.setHex(0xebd55a); // Brand yellow
                    hoveredGroup.userData.circle.material.opacity = 0.95;
                }
                
                // Enhanced shadow on hover
                if (hoveredGroup.userData.shadowCircle) {
                    hoveredGroup.userData.shadowCircle.material.opacity = 0.2;
                }
                
                // Darker plus sign for better contrast
                if (hoveredGroup.userData.horizontalLine) {
                    hoveredGroup.userData.horizontalLine.material.color.setHex(0x000000);
                    hoveredGroup.userData.horizontalLine.material.opacity = 1.0;
                }
                if (hoveredGroup.userData.verticalLine) {
                    hoveredGroup.userData.verticalLine.material.color.setHex(0x000000);
                    hoveredGroup.userData.verticalLine.material.opacity = 1.0;
                }
                
                container.style.cursor = 'pointer';
            }
        } else {
            container.style.cursor = 'move';
        }
    }

    clearHotspots() {
        const viewer = viewers[this.location];
        
        // Remove from sphere and dispose properly
        this.hotspots.forEach(hotspotGroup => {
            viewer.sphere.remove(hotspotGroup);
            
            // Dispose of all child geometries and materials
            hotspotGroup.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
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

    fadeOut(duration = 400) {
        return new Promise((resolve) => {
            if (this.hotspots.length === 0) {
                resolve();
                return;
            }

            // Make sure all hotspots are visible before fading
            this.hotspots.forEach(hotspotGroup => {
                hotspotGroup.visible = true;
            });

            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const opacity = 1 - progress;

                this.hotspots.forEach(hotspotGroup => {
                    // Fade main circle
                    if (hotspotGroup.userData.circle) {
                        hotspotGroup.userData.circle.material.opacity = 0.85 * opacity;
                    }
                    
                    // Fade shadow
                    if (hotspotGroup.userData.shadowCircle) {
                        hotspotGroup.userData.shadowCircle.material.opacity = 0.1 * opacity;
                    }
                    
                    // Fade plus sign
                    if (hotspotGroup.userData.horizontalLine) {
                        hotspotGroup.userData.horizontalLine.material.opacity = 0.9 * opacity;
                    }
                    if (hotspotGroup.userData.verticalLine) {
                        hotspotGroup.userData.verticalLine.material.opacity = 0.9 * opacity;
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }

    fadeIn(duration = 400) {
        return new Promise((resolve) => {
            if (this.hotspots.length === 0) {
                resolve();
                return;
            }

            // Make sure all hotspots are visible and start with 0 opacity
            this.hotspots.forEach(hotspotGroup => {
                hotspotGroup.visible = true;
                
                // Set initial opacity to 0
                if (hotspotGroup.userData.circle) {
                    hotspotGroup.userData.circle.material.opacity = 0;
                }
                if (hotspotGroup.userData.shadowCircle) {
                    hotspotGroup.userData.shadowCircle.material.opacity = 0;
                }
                if (hotspotGroup.userData.horizontalLine) {
                    hotspotGroup.userData.horizontalLine.material.opacity = 0;
                }
                if (hotspotGroup.userData.verticalLine) {
                    hotspotGroup.userData.verticalLine.material.opacity = 0;
                }
            });

            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.hotspots.forEach(hotspotGroup => {
                    // Fade in main circle
                    if (hotspotGroup.userData.circle) {
                        hotspotGroup.userData.circle.material.opacity = 0.85 * progress;
                    }
                    
                    // Fade in shadow
                    if (hotspotGroup.userData.shadowCircle) {
                        hotspotGroup.userData.shadowCircle.material.opacity = 0.1 * progress;
                    }
                    
                    // Fade in plus sign
                    if (hotspotGroup.userData.horizontalLine) {
                        hotspotGroup.userData.horizontalLine.material.opacity = 0.9 * progress;
                    }
                    if (hotspotGroup.userData.verticalLine) {
                        hotspotGroup.userData.verticalLine.material.opacity = 0.9 * progress;
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
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

    // Camera with optimized near/far planes for better depth precision
    viewer.camera = new THREE.PerspectiveCamera(
        70, 
        container.clientWidth / container.clientHeight, 
        1, // Increased near plane to improve depth precision
        1000
    );
    viewer.camera.position.set(0, 0, 0.1);
    
    // Enhanced camera matrix updates for stability during movement
    viewer.camera.matrixAutoUpdate = true;

    // Renderer with enhanced precision and performance optimizations
    viewer.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance',
        logarithmicDepthBuffer: false, // Disable for better performance
        stencil: false // Disable stencil buffer for better performance
    });
    
    // Enhanced renderer settings for camera movement stability
    viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    viewer.renderer.setSize(container.clientWidth, container.clientHeight);
    viewer.renderer.sortObjects = true; // Ensure proper render order
    viewer.renderer.autoClear = true;
    
    // Optimize depth testing
    viewer.renderer.context.enable(viewer.renderer.context.DEPTH_TEST);
    viewer.renderer.context.depthFunc(viewer.renderer.context.LEQUAL);
    container.appendChild(viewer.renderer.domElement);

    // Sphere geometry for panorama with optimizations
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert the sphere

    // Create sphere with optimized material
    const material = new THREE.MeshBasicMaterial({
        map: null,
        side: THREE.FrontSide // Optimize since we're inside the sphere
    });
    
    viewer.sphere = new THREE.Mesh(geometry, material);
    
    // Set render order to ensure sphere renders before hotspots
    viewer.sphere.renderOrder = 0;
    viewer.sphere.matrixAutoUpdate = true;
    
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

// Animation loop with performance optimizations for camera movement
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    // Performance tracking
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Update average frame time for adaptive rendering
    frameCount++;
    if (frameCount % 10 === 0) {
        avgFrameTime = avgFrameTime * 0.9 + deltaTime * 0.1;
    }
    
    // Determine if we should use performance mode (if frame rate is struggling)
    const isPerformanceMode = avgFrameTime > 20; // Roughly 50fps threshold
    
    ['club', 'etage'].forEach(location => {
        const viewer = viewers[location];
        
        if (!viewer.sphere || !viewer.camera || !viewer.renderer) return;
        
        // Auto-rotation
        if (viewer.isAutoRotating && !viewer.isUserInteracting && !viewer.isTransitioning) {
            viewer.targetRotationX += autoRotateSpeed;
        }
        
        // Check if camera is actually moving to optimize rendering
        const rotationSpeed = isPerformanceMode ? 0.08 : 0.05; // Faster convergence in performance mode
        const rotationDelta = Math.abs(viewer.targetRotationX - viewer.sphere.rotation.y);
        const verticalDelta = Math.abs(viewer.targetRotationY - (viewer.currentVerticalRotation || 0));
        const isMoving = rotationDelta > 0.001 || verticalDelta > 0.001 || viewer.isUserInteracting;
        
        // Update rotation with adaptive smoothing
        viewer.sphere.rotation.y += (viewer.targetRotationX - viewer.sphere.rotation.y) * rotationSpeed;
        
        // Vertical rotation with limits
        const verticalRotation = Math.max(-Math.PI/3, Math.min(Math.PI/3, viewer.targetRotationY));
        viewer.currentVerticalRotation = verticalRotation;
        
        // Optimize camera position updates during movement
        const phi = Math.PI/2 - verticalRotation;
        const theta = viewer.sphere.rotation.y;
        
        // Use more efficient camera positioning
        const radius = 100;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        
        viewer.camera.position.x = radius * sinPhi * cosTheta;
        viewer.camera.position.y = radius * cosPhi;
        viewer.camera.position.z = radius * sinPhi * sinTheta;
        
        viewer.camera.lookAt(0, 0, 0);
        
        // Adaptive rendering based on performance and movement
        if (isMoving) {
            // During movement, use performance-optimized rendering
            if (isPerformanceMode) {
                // Skip some frames or reduce quality during performance issues
                viewer.renderer.render(viewer.scene, viewer.camera);
            } else {
                // Normal high-quality rendering
                viewer.renderer.clear();
                viewer.renderer.render(viewer.scene, viewer.camera);
            }
        } else {
            // Static scene - always use normal rendering
            viewer.renderer.render(viewer.scene, viewer.camera);
        }
        
        // Adaptive hotspot management during movement
        if (hotspotManagers[location] && isMoving && isPerformanceMode) {
            // Could implement simplified hotspot rendering here if needed
            // For now, the render order optimizations should handle this
        }
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
async function loadViewpoint(location, id, isInitial = false) {
    const viewer = viewers[location];
    const wasAutoRotating = viewer.isAutoRotating;
    
    viewer.isTransitioning = true;
    stopAutoRotate(location); // Stop rotation during transition
    
    const viewpoint = viewpoints[location][id - 1]; // Get viewpoint data by id (1-based)
    const container = document.getElementById(`${location}-viewer`);
    
    // Fade out hotspots first, then clear them (only if not initial load)
    if (hotspotManagers[location] && !isInitial) {
        await hotspotManagers[location].fadeOut(300);
        hotspotManagers[location].clearHotspots();
    }
    
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
                    
                    // Load hotspots for the new viewpoint with fade in
                    if (hotspotManagers[location]) {
                        hotspotManagers[location].loadHotspots(id, false); // Start invisible
                        // Add a small delay before fading in hotspots for better visual flow
                        setTimeout(() => {
                            hotspotManagers[location].fadeIn(400);
                        }, 200);
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
                hotspotManagers[location].loadHotspots(id, false); // Start invisible
                // Fade in hotspots even on error
                setTimeout(() => {
                    hotspotManagers[location].fadeIn(400);
                }, 200);
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

// Simple Positioning Mode System
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

        // Setup copy button
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
        
        // Setup click handlers for each viewer
        ['club', 'etage'].forEach(location => {
            const container = document.getElementById(`${location}-viewer`);
            const canvas = container ? container.querySelector('canvas') : null;
            
            if (canvas) {
                const handler = (event) => this.handleClick(event, location);
                this.mouseHandlers.set(location, handler);
                canvas.addEventListener('mousedown', handler);
                
                // Visual feedback
                container.style.cursor = 'crosshair';
                canvas.style.cursor = 'crosshair';
            }
        });
        
        console.log('Click on viewers to get coordinates. Press P to toggle off.');
    },

    disable() {
        this.overlay.style.display = 'none';
        
        // Remove click handlers and reset cursors
        ['club', 'etage'].forEach(location => {
            const container = document.getElementById(`${location}-viewer`);
            const canvas = container ? container.querySelector('canvas') : null;
            
            if (canvas) {
                const handler = this.mouseHandlers.get(location);
                if (handler) {
                    canvas.removeEventListener('mousedown', handler);
                    this.mouseHandlers.delete(location);
                }
                
                // Reset cursors
                container.style.cursor = 'move';
                canvas.style.cursor = 'move';
            }
        });
        
        // Clear display
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
        
        // Update display
        document.getElementById('pos-location').textContent = location;
        document.getElementById('pos-viewpoint').textContent = currentViewpoint;
        
        // Calculate normalized device coordinates
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        // Raycast to find intersection
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, viewer.camera);
        const intersects = raycaster.intersectObjects([viewer.sphere]);
        
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const uvPos = this.worldPositionToUV(intersectionPoint);
            
            const uFormatted = uvPos.u.toFixed(3);
            const vFormatted = uvPos.v.toFixed(3);
            
            // Update display
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

// Initialize positioning system when page loads
document.addEventListener('DOMContentLoaded', () => {
    PositioningMode.init();
});

