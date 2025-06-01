// ===== PILOTS HOUSE CONTROLLER =====
// Handles indoor 360° experience with room navigation

ISOKARI.PilotsController = class {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentMesh = null;
        this.currentTexture = null;
        this.isUserInteracting = false;
        this.autoRotateEnabled = true;
        this.animationId = null;

        // Interaction variables
        this.lon = 0;
        this.lat = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;

        // Zoom variables
        this.currentZoom = 75;
        this.minZoom = 50;
        this.maxZoom = 100;
        this.zoomSensitivity = 2;

        // Touch variables
        this.touchDistance = 0;
        this.prevTouchDistance = 0;

        // Settings
        this.autoRotateSpeed = 0.015; // Slower for indoor spaces
        this.dragSensitivity = 0.2;

        // Room system
        this.currentRoomIndex = 0;
        this.rooms = [
            {
                name: 'Main Living Area',
                image: 'assets/pilots-house/living-room.jpg',
                hotspots: [
                    { x: 0.3, y: 0.5, target: 1, label: 'Kitchen' },
                    { x: -0.3, y: 0.4, target: 2, label: 'Bedroom' }
                ]
            },
            {
                name: 'Kitchen',
                image: 'assets/pilots-house/kitchen.jpg',
                hotspots: [
                    { x: 0, y: 0.6, target: 0, label: 'Living Room' },
                    { x: 0.4, y: 0.3, target: 2, label: 'Bedroom' }
                ]
            },
            {
                name: 'Bedroom',
                image: 'assets/pilots-house/bedroom.jpg',
                hotspots: [
                    { x: -0.2, y: 0.5, target: 0, label: 'Living Room' },
                    { x: 0.2, y: 0.4, target: 1, label: 'Kitchen' }
                ]
            }
        ];

        // Fallback images if room images aren't available
        this.fallbackImages = [
            'https://via.placeholder.com/2048x1024/8B4513/FFFFFF?text=Living+Room+360',
            'https://via.placeholder.com/2048x1024/A0522D/FFFFFF?text=Kitchen+360',
            'https://via.placeholder.com/2048x1024/CD853F/FFFFFF?text=Bedroom+360'
        ];

        this.hotspots = [];
        this.isTransitioning = false;
    }

    async initialize() {
        try {
            const container = document.getElementById('pilots-viewer');
            if (!container) {
                throw new Error('Pilots viewer container not found');
            }

            this.createScene(container);
            await this.loadRoom(this.currentRoomIndex);
            this.setupEventListeners();
            this.createHotspots();
            this.startAnimation();

            // Store in global state
            ISOKARI.State.scenes.pilots = this.scene;
            ISOKARI.State.cameras.pilots = this.camera;
            ISOKARI.State.renderers.pilots = this.renderer;

            console.log('🏠 Pilots House controller initialized');
        } catch (error) {
            console.error('Error initializing pilots house controller:', error);
        }
    }

    createScene(container) {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            this.currentZoom,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2; // Slightly brighter for indoor spaces
        container.appendChild(this.renderer.domElement);
    }

    async loadRoom(roomIndex) {
        if (roomIndex < 0 || roomIndex >= this.rooms.length) {
            console.error('Invalid room index:', roomIndex);
            return;
        }

        return new Promise((resolve, reject) => {
            const room = this.rooms[roomIndex];
            const loader = new THREE.TextureLoader();
            loader.crossOrigin = 'anonymous';

            // Try to load the actual room image, fallback to placeholder
            const imageUrl = room.image;
            const fallbackUrl = this.fallbackImages[roomIndex];

            loader.load(
                imageUrl,
                (texture) => {
                    this.createRoomMesh(texture);
                    this.updateRoomInfo(room.name);
                    this.createRoomHotspots(room.hotspots);
                    resolve();
                },
                (progress) => {
                    console.log('Loading room progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
                },
                (error) => {
                    console.warn('Failed to load room image, using fallback:', error);
                    // Load fallback image
                    loader.load(
                        fallbackUrl,
                        (texture) => {
                            this.createRoomMesh(texture);
                            this.updateRoomInfo(`${room.name} (Preview)`);
                            this.createRoomHotspots(room.hotspots);
                            resolve();
                        },
                        undefined,
                        (fallbackError) => {
                            console.error('Failed to load fallback image:', fallbackError);
                            reject(fallbackError);
                        }
                    );
                }
            );
        });
    }

    createRoomMesh(texture) {
        // Dispose of previous resources
        if (this.currentTexture) {
            this.currentTexture.dispose();
        }
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
            ISOKARI.Utils.disposeThreeObject(this.currentMesh);
        }

        // Configure texture
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.flipY = false;

        // Create sphere geometry for 360° room
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Invert for interior view

        // Create material
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.FrontSide
        });

        // Create mesh
        this.currentMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.currentMesh);
        
        this.currentTexture = texture;
    }

    createRoomHotspots(hotspotData) {
        // Clear existing hotspots
        this.clearHotspots();

        hotspotData.forEach((hotspot, index) => {
            this.createHotspot(hotspot, index);
        });
    }

    createHotspot(hotspotData, index) {
        // Create hotspot element
        const hotspot = document.createElement('div');
        hotspot.className = 'pilots-hotspot';
        hotspot.dataset.target = hotspotData.target;
        hotspot.dataset.index = index;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'pilots-tooltip';
        tooltip.textContent = hotspotData.label;
        hotspot.appendChild(tooltip);

        // Position hotspot (simplified positioning)
        const x = (hotspotData.x * 50) + 50; // Convert to percentage
        const y = (hotspotData.y * 50) + 50;
        
        hotspot.style.left = `${x}%`;
        hotspot.style.top = `${y}%`;

        // Add click handler
        hotspot.addEventListener('click', () => {
            this.navigateToRoom(hotspotData.target);
        });

        // Add to container
        const container = document.getElementById('pilots-viewer');
        container.appendChild(hotspot);
        
        this.hotspots.push(hotspot);
    }

    clearHotspots() {
        this.hotspots.forEach(hotspot => {
            hotspot.remove();
        });
        this.hotspots = [];
    }

    async navigateToRoom(roomIndex) {
        if (this.isTransitioning || roomIndex === this.currentRoomIndex) {
            return;
        }

        this.isTransitioning = true;

        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'pilots-room-transition active';
        document.getElementById('pilots-viewer').appendChild(overlay);

        // Wait for transition
        await ISOKARI.Utils.wait(250);

        // Load new room
        await this.loadRoom(roomIndex);
        this.currentRoomIndex = roomIndex;

        // Update room indicators
        this.updateRoomIndicators();

        // Remove transition overlay
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 500);
            this.isTransitioning = false;
        }, 250);
    }

    updateRoomInfo(roomName) {
        const titleElement = document.querySelector('#pilots-ui-panel .panel-title');
        if (titleElement) {
            titleElement.textContent = roomName;
        }
    }

    updateRoomIndicators() {
        const indicators = document.querySelectorAll('.room-indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentRoomIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    createHotspots() {
        // Create room navigation indicators in UI
        const navControls = document.querySelector('.pilots-nav-controls');
        if (navControls) {
            // Clear existing indicators
            const existingIndicators = navControls.querySelector('.room-indicators');
            if (existingIndicators) {
                existingIndicators.remove();
            }

            // Create new indicators
            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'room-indicators';

            this.rooms.forEach((room, index) => {
                const indicator = document.createElement('div');
                indicator.className = `room-indicator ${index === this.currentRoomIndex ? 'active' : ''}`;
                indicator.title = room.name;
                indicator.addEventListener('click', () => this.navigateToRoom(index));
                indicatorsContainer.appendChild(indicator);
            });

            navControls.appendChild(indicatorsContainer);
        }
    }

    setupEventListeners() {
        const container = document.getElementById('pilots-viewer');

        // Mouse events
        container.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        container.addEventListener('mouseup', () => this.onMouseUp(), false);
        container.addEventListener('mouseout', () => this.onMouseUp(), false);
        container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        // Touch events
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', () => this.onTouchEnd(), false);

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    }

    // Mouse interaction handlers (similar to island)
    onMouseDown(event) {
        // Don't interfere with hotspot clicks
        if (event.target.closest('.pilots-hotspot')) {
            return;
        }

        event.preventDefault();
        this.isUserInteracting = true;

        this.onPointerDownMouseX = event.clientX;
        this.onPointerDownMouseY = event.clientY;
        this.onPointerDownLon = this.lon;
        this.onPointerDownLat = this.lat;
    }

    onMouseMove(event) {
        if (this.isUserInteracting) {
            const deltaX = (this.onPointerDownMouseX - event.clientX) * this.dragSensitivity;
            const deltaY = (event.clientY - this.onPointerDownMouseY) * this.dragSensitivity;
            
            this.lon = deltaX + this.onPointerDownLon;
            this.lat = Math.max(-85, Math.min(85, deltaY + this.onPointerDownLat));
        }
    }

    onMouseUp() {
        this.isUserInteracting = false;
    }

    onMouseWheel(event) {
        event.preventDefault();

        const delta = event.deltaY || event.detail || event.wheelDelta;

        if (delta > 0) {
            this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomSensitivity);
        } else {
            this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomSensitivity);
        }

        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();
    }

    // Touch interaction handlers
    onTouchStart(event) {
        // Don't interfere with hotspot touches
        if (event.target.closest('.pilots-hotspot')) {
            return;
        }

        event.preventDefault();

        if (event.touches.length === 1) {
            this.isUserInteracting = true;
            this.onPointerDownMouseX = event.touches[0].pageX;
            this.onPointerDownMouseY = event.touches[0].pageY;
            this.onPointerDownLon = this.lon;
            this.onPointerDownLat = this.lat;
        } else if (event.touches.length === 2) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            this.prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isUserInteracting) {
            event.preventDefault();

            const deltaX = (this.onPointerDownMouseX - event.touches[0].pageX) * this.dragSensitivity;
            const deltaY = (event.touches[0].pageY - this.onPointerDownMouseY) * this.dragSensitivity;
            
            this.lon = deltaX + this.onPointerDownLon;
            this.lat = Math.max(-85, Math.min(85, deltaY + this.onPointerDownLat));

        } else if (event.touches.length === 2) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            this.touchDistance = Math.sqrt(dx * dx + dy * dy);

            if (this.prevTouchDistance > 0) {
                const zoomFactor = this.touchDistance / this.prevTouchDistance;
                this.currentZoom = this.currentZoom / zoomFactor;
                this.currentZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom));

                this.camera.fov = this.currentZoom;
                this.camera.updateProjectionMatrix();
            }
            this.prevTouchDistance = this.touchDistance;
        }
    }

    onTouchEnd() {
        this.isUserInteracting = false;
        this.touchDistance = 0;
        this.prevTouchDistance = 0;
    }

    // Animation loop
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            // Only animate if this is the current section
            if (ISOKARI.State.currentSection !== 'pilots') {
                return;
            }

            // Auto-rotation when not interacting
            if (!this.isUserInteracting && this.autoRotateEnabled) {
                this.lon += this.autoRotateSpeed;
            }

            // Update camera position
            const phi = THREE.MathUtils.degToRad(90 - this.lat);
            const theta = THREE.MathUtils.degToRad(this.lon);

            this.camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
            this.camera.position.y = 100 * Math.cos(phi);
            this.camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

            this.camera.lookAt(0, 0, 0);

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    // Keyboard controls
    onKeyDown(event) {
        // Only handle if we're in the pilots section
        if (ISOKARI.State.currentSection !== 'pilots') return;

        const hasModifiers = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
        
        if (!hasModifiers) {
            switch(event.code) {
                case 'Digit1':
                    event.preventDefault();
                    this.navigateToRoom(0);
                    break;
                case 'Digit2':
                    event.preventDefault();
                    this.navigateToRoom(1);
                    break;
                case 'Digit3':
                    event.preventDefault();
                    this.navigateToRoom(2);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.navigateToRoom((this.currentRoomIndex - 1 + this.rooms.length) % this.rooms.length);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.navigateToRoom((this.currentRoomIndex + 1) % this.rooms.length);
                    break;
            }
        }
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    dispose() {
        this.stopAnimation();
        this.clearHotspots();
        
        if (this.currentTexture) {
            this.currentTexture.dispose();
            this.currentTexture = null;
        }

        if (this.currentMesh) {
            ISOKARI.Utils.disposeThreeObject(this.currentMesh);
            this.scene?.remove(this.currentMesh);
            this.currentMesh = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
    }

    // Public methods
    getCurrentRoom() {
        return this.currentRoomIndex;
    }

    getTotalRooms() {
        return this.rooms.length;
    }

    setAutoRotate(enabled) {
        this.autoRotateEnabled = enabled;
    }

    resetView() {
        this.lon = 0;
        this.lat = 0;
        this.currentZoom = 75;
        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();
    }
};

// Utility function for promises
ISOKARI.Utils = ISOKARI.Utils || {};
ISOKARI.Utils.wait = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

console.log('🏠 Pilots House Controller Loaded');