// ===== PILOTS HOUSE CONTROLLER =====
// Handles indoor 360° mirror ball experience with room information

ISOKARI.PilotsController = class {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mirrorBallMesh = null;
        this.currentEnvTexture = null;
        this.isUserInteracting = false;
        this.autoRotateEnabled = true;
        this.uiPanelVisible = true;
        this.iconRotationAngle = 0;
        this.animationId = null;
        this.iconAnimationId = null;

        // Interaction variables (same as island)
        this.lon = 0;
        this.lat = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;

        // Zoom variables (same as island)
        this.currentZoom = 90;
        this.minZoom = 50;
        this.maxZoom = 120;
        this.zoomSensitivity = 2;

        // Touch zoom variables
        this.touchDistance = 0;
        this.prevTouchDistance = 0;

        // Settings (same as island)
        this.autoRotateSpeed = 0.025;
        this.dragSensitivity = 0.25;

        // Constants for latitude clamping (same as island)
        this.MAX_LAT_DEG = 84.5;
        this.UP_VECTOR_SMOOTHING_THRESHOLD = 75;

        // Pilots house images and room information
        this.imageUrls = [
            'https://assets.360.petsq.works/isokari/4960/0001_4960.jpg', // Exterior
            'https://assets.360.petsq.works/isokari/4960/0002_4960.jpg', // Interior 1
            'https://assets.360.petsq.works/isokari/4960/0003_4960.jpg', // Interior 2
            'https://assets.360.petsq.works/isokari/4960/0004_4960.jpg', // Interior 3
            'https://assets.360.petsq.works/isokari/4960/0005_4960.jpg'  // Interior 4
        ];

        // Room information for each image
        this.roomInfo = [
            {
                name: "Pilots House Exterior",
                description: "The weathered stone facade of the pilots house stands resilient against Baltic storms. Built in the 1800s, this structure served as both home and watchtower for the maritime pilots who guided ships safely through Isokari's treacherous waters.",
                type: "exterior",
                details: "Stone Construction • 19th Century • Maritime Heritage"
            },
            {
                name: "Main Living Room",
                description: "The heart of the pilots house, where families gathered during long winter months. The sturdy wooden beams and simple furnishings reflect the practical lifestyle of those who made their living from the sea.",
                type: "interior",
                details: "Central Hearth • Family Gathering Space • Maritime Artifacts"
            },
            {
                name: "Pilots Navigation Room",
                description: "This intimate space served as the nerve center for maritime operations. Charts, compass equipment, and weather instruments lined these walls as pilots planned safe passages for merchant vessels.",
                type: "interior",
                details: "Navigation Equipment • Maritime Charts • Weather Station"
            },
            {
                name: "Pilots Bedroom",
                description: "The modest sleeping quarters of the pilot family. Simple wooden furniture and practical storage solutions maximized the limited space while providing comfort during harsh island winters.",
                type: "interior",
                details: "Family Quarters • Simple Furnishings • Practical Design"
            },
            {
                name: "Kitchen & Workspace",
                description: "The functional kitchen where meals were prepared from preserved foods and occasional fresh fish. This space also served as a workshop for maintaining maritime equipment and household repairs.",
                type: "interior",
                details: "Food Preparation • Maritime Tools • Multi-purpose Space"
            }
        ];

        this.currentImageIndex = 0;
    }

    async initialize() {
        try {
            const container = document.getElementById('pilots-viewer');
            if (!container) {
                throw new Error('Pilots viewer container not found');
            }

            this.createScene(container);
            await this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
            this.setupEventListeners();
            this.updateRoomInfo();
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
        // Create scene (same as island)
        this.scene = new THREE.Scene();

        // Create camera (same as island)
        this.camera = new THREE.PerspectiveCamera(
            this.currentZoom,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);

        // Create renderer (same as island)
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        container.appendChild(this.renderer.domElement);
    }

    async loadEnvironmentTexture(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.crossOrigin = 'anonymous';

            loader.load(
                url,
                (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.flipY = false;

                    // Dispose of the old texture if it exists
                    if (this.currentEnvTexture) {
                        this.currentEnvTexture.dispose();
                    }
                    this.currentEnvTexture = texture;

                    // Create or update mirror ball mesh
                    if (!this.mirrorBallMesh) {
                        this.createMirrorBallMesh();
                        this.scene.add(this.mirrorBallMesh);
                    } else {
                        this.mirrorBallMesh.material.envMap = this.currentEnvTexture;
                        this.mirrorBallMesh.material.needsUpdate = true;
                    }

                    // Update room information
                    this.updateRoomInfo();

                    resolve();
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
                },
                (error) => {
                    console.error('Error loading texture:', error);
                    reject(error);
                }
            );
        });
    }

    createMirrorBallMesh() {
        // Same mirror ball setup as island
        const geometry = new THREE.SphereGeometry(8, 64, 32);
        geometry.scale(-1, -1, 1);

        const material = new THREE.MeshBasicMaterial({
            envMap: this.currentEnvTexture,
            reflectivity: 1.0,
            side: THREE.BackSide
        });

        this.mirrorBallMesh = new THREE.Mesh(geometry, material);
        this.mirrorBallMesh.position.set(0, 0, -2);
    }

    updateRoomInfo() {
        const currentRoom = this.roomInfo[this.currentImageIndex];
        
        // Update panel title
        const titleElement = document.querySelector('#pilots-ui-panel .panel-title');
        if (titleElement) {
            titleElement.textContent = currentRoom.name;
        }

        // Update panel description
        const descElement = document.querySelector('#pilots-ui-panel .panel-description');
        if (descElement) {
            descElement.textContent = currentRoom.description;
        }

        // Update room details
        const detailsElement = document.querySelector('#pilots-ui-panel .room-details');
        if (detailsElement) {
            detailsElement.textContent = currentRoom.details;
        }

        // Update progress indicator
        const progressElement = document.querySelector('#pilots-ui-panel .room-progress');
        if (progressElement) {
            progressElement.textContent = `${this.currentImageIndex + 1} / ${this.imageUrls.length}`;
        }
    }

    setupEventListeners() {
        const container = document.getElementById('pilots-viewer');

        // Mouse events (same as island, but use document for smooth dragging)
        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.addEventListener('mouseup', () => this.onMouseUp(), false);
        container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        // Touch events
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', () => this.onTouchEnd(), false);

        // Control buttons
        const autoRotateToggle = document.getElementById('pilots-auto-rotate-toggle');
        const prevButton = document.getElementById('pilots-prev-button');
        const nextButton = document.getElementById('pilots-next-button');
        const uiToggleButton = document.getElementById('pilots-ui-toggle-button');
        const btqButton = document.getElementById('pilots-btq-button');

        if (autoRotateToggle) autoRotateToggle.addEventListener('click', () => this.toggleAutoRotate());
        if (prevButton) prevButton.addEventListener('click', () => this.goToPrevious());
        if (nextButton) nextButton.addEventListener('click', () => this.goToNext());
        if (uiToggleButton) uiToggleButton.addEventListener('click', () => this.toggleUIPanel());
        if (btqButton) btqButton.addEventListener('click', () => this.openBTQ360());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    }

    // Mouse interaction handlers (same as island)
    onMouseDown(event) {
        // Only start interaction if clicking on the viewer, not UI elements
        if (!event.target.closest('#pilots-viewer')) {
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
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));
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

    // Touch interaction handlers (same as island)
    onTouchStart(event) {
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
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));

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

    // UI Controls (similar to island but adapted for pilots house)
    toggleAutoRotate() {
        const button = document.getElementById('pilots-auto-rotate-toggle');
        const icon = document.getElementById('pilots-auto-rotate-icon');

        this.autoRotateEnabled = !this.autoRotateEnabled;

        if (this.autoRotateEnabled) {
            button?.classList.add('active');
            this.startIconRotation(icon);
            if (button) button.title = 'Disable Auto-Rotation';
        } else {
            button?.classList.remove('active');
            this.stopIconRotation(icon);
            if (button) button.title = 'Enable Auto-Rotation';
        }
    }

    startIconRotation(icon) {
        if (!icon || this.iconAnimationId) return;
        
        const rotateIcon = () => {
            this.iconRotationAngle += 0.5;
            icon.style.transform = `rotate(${this.iconRotationAngle}deg)`;
            this.iconAnimationId = requestAnimationFrame(rotateIcon);
        };
        
        rotateIcon();
    }

    stopIconRotation(icon) {
        if (this.iconAnimationId) {
            cancelAnimationFrame(this.iconAnimationId);
            this.iconAnimationId = null;
        }
    }

    toggleUIPanel() {
        if (this.uiPanelVisible) {
            this.hideUIPanel();
        } else {
            this.showUIPanel();
        }
    }

    showUIPanel() {
        const panel = document.getElementById('pilots-ui-panel');
        const toggleButton = document.getElementById('pilots-ui-toggle-button');
        const btqButton = document.getElementById('pilots-btq-button');

        panel?.classList.add('visible');
        toggleButton?.classList.add('panel-open'); // Add panel-open class for desktop repositioning
        btqButton?.classList.add('hidden'); // Hide BTQ button when UI is shown
        this.uiPanelVisible = true;
    }

    hideUIPanel() {
        const panel = document.getElementById('pilots-ui-panel');
        const toggleButton = document.getElementById('pilots-ui-toggle-button');
        const btqButton = document.getElementById('pilots-btq-button');

        panel?.classList.remove('visible');
        toggleButton?.classList.remove('panel-open'); // Remove panel-open class for desktop repositioning
        btqButton?.classList.remove('hidden'); // Show BTQ button when UI is hidden
        this.uiPanelVisible = false;
    }

    goToPrevious() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
        this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
    }

    goToNext() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
        this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
    }

    openBTQ360() {
        window.open('https://btq360.com', '_blank');
    }

    // Animation loop (same as island)
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

            // Update camera position based on lat/lon (same as island)
            if (this.mirrorBallMesh) {
                const phi = THREE.MathUtils.degToRad(90 - this.lat);
                const theta = THREE.MathUtils.degToRad(this.lon);
                
                const distance = 3.5;
                
                this.camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
                this.camera.position.y = distance * Math.cos(phi);
                this.camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
                
                // Camera up vector stabilization (same as island)
                const upBias = Math.abs(this.lat) / this.MAX_LAT_DEG;
                
                if (upBias > this.UP_VECTOR_SMOOTHING_THRESHOLD / this.MAX_LAT_DEG) {
                    const smoothFactor = (upBias - this.UP_VECTOR_SMOOTHING_THRESHOLD / this.MAX_LAT_DEG) / (1 - this.UP_VECTOR_SMOOTHING_THRESHOLD / this.MAX_LAT_DEG);
                    const upX = Math.sin(THREE.MathUtils.degToRad(this.lon)) * smoothFactor * 0.1;
                    const upZ = -Math.cos(THREE.MathUtils.degToRad(this.lon)) * smoothFactor * 0.1;
                    this.camera.up.set(upX, 1 - smoothFactor * 0.1, upZ).normalize();
                } else {
                    this.camera.up.set(0, 1, 0);
                }

                this.camera.lookAt(this.mirrorBallMesh.position);
            }

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
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Space':
                case 'KeyR':
                    event.preventDefault();
                    break;
            }
        }
        
        if (!hasModifiers) {
            switch(event.code) {
                case 'ArrowRight':
                    this.goToNext();
                    break;
                    
                case 'ArrowLeft':
                    this.goToPrevious();
                    break;
                    
                case 'Space':
                    this.toggleUIPanel();
                    break;
                    
                case 'KeyR':
                    this.toggleAutoRotate();
                    break;
            }
        }
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.stopIconRotation();
    }

    dispose() {
        this.stopAnimation();
        
        // Clean up document event listeners
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        if (this.currentEnvTexture) {
            this.currentEnvTexture.dispose();
            this.currentEnvTexture = null;
        }

        if (this.mirrorBallMesh) {
            ISOKARI.Utils.disposeThreeObject(this.mirrorBallMesh);
            this.scene?.remove(this.mirrorBallMesh);
            this.mirrorBallMesh = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
    }

    // Public methods for external control
    setAutoRotate(enabled) {
        this.autoRotateEnabled = enabled;
        this.toggleAutoRotate();
    }

    getCurrentImageIndex() {
        return this.currentImageIndex;
    }

    getTotalImages() {
        return this.imageUrls.length;
    }

    jumpToImage(index) {
        if (index >= 0 && index < this.imageUrls.length) {
            this.currentImageIndex = index;
            this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
        }
    }

    resetView() {
        this.lon = 0;
        this.lat = 0;
        this.currentZoom = 90;
        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();
    }
};

console.log('🏠 Pilots House Controller Loaded');