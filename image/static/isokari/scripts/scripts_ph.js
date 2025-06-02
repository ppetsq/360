// ===== PILOTS HOUSE CONTROLLER WITH ISLAND-STYLE UI (FIXED) =====
// Handles indoor 360° mirror ball experience with house image and matching UI

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
        this.isMobile = window.innerWidth <= 768;
        // Removed: this.hideUiTimeout = null; // No longer needed for temporary hide

        // Interaction variables (same as island)
        this.lon = 0;
        this.lat = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;
        this.isDragging = false; // Track if actual dragging occurred
        this.didZoom = false; // Track if zooming occurred

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

        // Pilots house images
        this.imageUrls = [
            'https://assets.360.petsq.works/isokari/4960/0002_4960.jpg', // Interior 1
            'https://assets.360.petsq.works/isokari/4960/0003_4960.jpg', // Interior 2
            'https://assets.360.petsq.works/isokari/4960/0004_4960.jpg', // Interior 3
            'https://assets.360.petsq.works/isokari/4960/0005_4960.jpg',  // Interior 4
            'https://assets.360.petsq.works/isokari/4960/0001_4960.jpg' // Exterior
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
            this.setupMobileUI();
            this.startAnimation();
            
            if (this.autoRotateEnabled) {
                const icon = document.getElementById('pilots-auto-rotate-icon');
                this.startIconRotation(icon);
            }

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

        // Create renderer - EXACTLY like island
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
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
        // FIXED: Use exact same setup as working island controller
        const geometry = new THREE.SphereGeometry(8, 64, 32);
        geometry.scale(-1, -1, 1); // CHANGED: Back to island's working scaling

        const material = new THREE.MeshBasicMaterial({
            envMap: this.currentEnvTexture,
            reflectivity: 1.0,
            side: THREE.BackSide // KEEP: This is correct for mirror ball
        });

        this.mirrorBallMesh = new THREE.Mesh(geometry, material);
        this.mirrorBallMesh.position.set(0, 0, -2);
    }

    setupMobileUI() {
        // Setup read more functionality for mobile
        const readMoreBtn = document.getElementById('pilots-read-more-btn');
        const description = document.querySelector('#pilots-ui-panel .panel-description');
        
        if (readMoreBtn && description) {
            readMoreBtn.addEventListener('click', () => {
                if (description.classList.contains('collapsed')) {
                    description.classList.remove('collapsed');
                    readMoreBtn.textContent = 'Read less';
                } else {
                    description.classList.add('collapsed');
                    readMoreBtn.textContent = 'Read more';
                }
                
                // Reposition house image after text change (only if house is visible, which it won't be on mobile now)
                if (this.isMobile && this.uiPanelVisible && document.getElementById('pilots-house-container')?.style.display !== 'none') {
                    setTimeout(() => {
                        this.positionHouseRelativeToUI();
                    }, 100);
                }
            });
    
            // Initialize as collapsed on mobile
            if (this.isMobile) {
                description.classList.add('collapsed');
                readMoreBtn.textContent = 'Read more';
            }
        }
    
        // Handle window resize for mobile detection and repositioning
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            // If switching between mobile/desktop, update house positioning
            if (wasMobile !== this.isMobile) {
                // Reset read more state when switching
                if (description && readMoreBtn) {
                    if (this.isMobile) {
                        description.classList.add('collapsed');
                        readMoreBtn.textContent = 'Read more';
                    } else {
                        description.classList.remove('collapsed');
                    }
                }
                
                // Reset house positioning when switching modes
                this.resetHousePositioning();
            }
            
            // Removed: No need to reposition if house is hidden on mobile.
            // if (this.isMobile && this.uiPanelVisible && wasMobile === this.isMobile) {
            //     setTimeout(() => {
            //         this.positionHouseRelativeToUI();
            //     }, 100);
            // }
        });
    }

    // Reset house positioning
    resetHousePositioning() {
        const houseContainer = document.getElementById('pilots-house-container');
        if (!houseContainer) return;
        
        // Remove all JavaScript-applied positioning styles
        houseContainer.style.removeProperty('bottom');
        houseContainer.style.removeProperty('opacity');
        houseContainer.style.removeProperty('visibility');
        houseContainer.style.removeProperty('display'); // Ensure display is reset
        
        // Remove positioned class
        houseContainer.classList.remove('positioned');
        
        console.log(`🔄 RESET HOUSE POSITIONING - Now ${this.isMobile ? 'MOBILE' : 'DESKTOP'} mode`);
        
        // If switching to mobile, ensure it's hidden. If switching to desktop, ensure it's visible if UI is open.
        if (this.isMobile) {
            houseContainer.style.setProperty('display', 'none', 'important');
        } else if (this.uiPanelVisible) {
            houseContainer.style.removeProperty('display'); // Allow CSS to control
            // No need to call positionHouseRelativeToUI for desktop, as it's handled by CSS
        }
    }

    setupEventListeners() {
        const container = document.getElementById('pilots-viewer');

        // Mouse events (same as island, but use document for smooth dragging)
        container.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        container.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
        container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
        // Removed: container.addEventListener('click', (e) => this.onClick(e), false); // Removed: Click listener to show/hide

        // Touch events
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', (e) => this.onTouchEnd(e), false);

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

    // New: Method to hide UI immediately upon interaction start
    hideUIPanelImmediately() {
        if (this.uiPanelVisible) {
            this.hideUIPanel();
        }
    }

    // Mouse interaction handlers (same as island)
    onMouseDown(event) {
        // Only start interaction if clicking on the viewer, not UI elements
        if (!event.target.closest('#pilots-viewer')) {
            return;
        }

        event.preventDefault();
        this.isUserInteracting = true;
        this.isDragging = false; // Reset dragging flag
        this.didZoom = false; // Reset zoom flag

        this.onPointerDownMouseX = event.clientX;
        this.onPointerDownMouseY = event.clientY;
        this.onPointerDownLon = this.lon;
        this.onPointerDownLat = this.lat;

        this.hideUIPanelImmediately(); // Hide UI immediately on interaction start
    }

    onMouseMove(event) {
        if (this.isUserInteracting) {
            const deltaX = (this.onPointerDownMouseX - event.clientX) * this.dragSensitivity;
            const deltaY = (event.clientY - this.onPointerDownMouseY) * this.dragSensitivity;
            
            // If movement is significant, set isDragging to true
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) { // 1px threshold for drag
                this.isDragging = true;
            }

            this.lon = deltaX + this.onPointerDownLon;
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));
        }
    }

    onMouseUp(event) {
        this.isUserInteracting = false;
        // Removed: Logic to show UI after drag/zoom
        this.isDragging = false; // Reset for next interaction
        this.didZoom = false; // Reset for next interaction
    }

    onMouseWheel(event) {
        event.preventDefault();

        this.didZoom = true; // Set zoom flag
        this.hideUIPanelImmediately(); // Hide UI immediately on zoom start

        const delta = event.deltaY || event.detail || event.wheelDelta;

        if (delta > 0) {
            this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomSensitivity);
        } else {
            this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomSensitivity);
        }

        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();

        // Removed: Debounce logic to show UI after zooming stops
    }

    // Touch interaction handlers (same as island)
    onTouchStart(event) {
        event.preventDefault();

        // Only hide UI if touching on the viewer area itself
        if (!event.target.closest('#pilots-viewer')) {
            return;
        }

        this.isUserInteracting = true;
        this.isDragging = false; // Reset dragging flag
        this.didZoom = false; // Reset zoom flag

        if (event.touches.length === 1) {
            this.onPointerDownMouseX = event.touches[0].pageX;
            this.onPointerDownMouseY = event.touches[0].pageY;
            this.onPointerDownLon = this.lon;
            this.onPointerDownLat = this.lat;
        } else if (event.touches.length === 2) {
            this.didZoom = true; // Pinch is a zoom interaction
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            this.prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
        this.hideUIPanelImmediately(); // Hide UI immediately on interaction start
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isUserInteracting) {
            event.preventDefault();

            const deltaX = (this.onPointerDownMouseX - event.touches[0].pageX) * this.dragSensitivity;
            const deltaY = (event.touches[0].pageY - this.onPointerDownMouseY) * this.dragSensitivity; // Corrected deltaY calculation
            
            // If movement is significant, set isDragging to true
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) { // 1px threshold for drag
                this.isDragging = true;
            }

            this.lon = deltaX + this.onPointerDownLon;
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));

        } else if (event.touches.length === 2) {
            this.didZoom = true; // Pinch is a zoom interaction
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

    onTouchEnd(event) {
        this.isUserInteracting = false;
        this.touchDistance = 0;
        this.prevTouchDistance = 0;

        // Removed: Logic to show UI after drag/zoom
        this.isDragging = false; // Reset for next interaction
        this.didZoom = false; // Reset for next interaction
    }

    // UI Controls (adapted from island)
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
        // This is the manual toggle, it should always override auto-hide/show
        if (this.uiPanelVisible) {
            this.hideUIPanel();
        } else {
            this.showUIPanel();
        }
    }

    showUIPanel() {
        this.uiPanelVisible = true; // Set visibility flag immediately
        const panel = document.getElementById('pilots-ui-panel');
        const toggleButton = document.getElementById('pilots-ui-toggle-button');
        const btqButton = document.getElementById('pilots-btq-button');
        const houseContainer = document.getElementById('pilots-house-container');
    
        panel?.classList.add('visible');
        toggleButton?.classList.add('panel-open');
        
        // Only show house container on desktop
        if (!this.isMobile) {
            houseContainer?.classList.add('visible');
            houseContainer?.classList.remove('positioned'); // Remove positioned class when showing (reset state)
            btqButton?.classList.add('hidden');
        } else {
            // Ensure it's hidden on mobile
            houseContainer?.classList.remove('visible');
            houseContainer?.classList.add('positioned'); // Keep it hidden and avoid position issues
            btqButton?.classList.remove('hidden'); // Stay visible on mobile
        }
    }

    hideUIPanel() {
        this.uiPanelVisible = false; // Set visibility flag immediately
        const panel = document.getElementById('pilots-ui-panel');
        const toggleButton = document.getElementById('pilots-ui-toggle-button');
        const btqButton = document.getElementById('pilots-btq-button');
        const houseContainer = document.getElementById('pilots-house-container');
    
        panel?.classList.remove('visible');
        toggleButton?.classList.remove('panel-open');
        houseContainer?.classList.remove('visible');
        houseContainer?.classList.remove('positioned'); // Clean up positioned class
        btqButton?.classList.remove('hidden');
        
        // MOBILE: Ensure house is hidden when UI is hidden
        if (this.isMobile && houseContainer) {
            houseContainer.style.setProperty('opacity', '0', 'important');
            houseContainer.style.setProperty('visibility', 'hidden', 'important');
            houseContainer.style.setProperty('display', 'none', 'important'); // Ensure it's not displayed
        }
    }

    positionHouseRelativeToUI() {
        // This function is no longer needed for mobile pilots house as it's hidden
        // but keeping the structure for clarity if future changes require it.
        if (!this.isMobile) {
            this.resetHousePositioning();
            return;
        }
        
        // Log that this function is effectively skipped on mobile for Pilots House
        console.log('🏠 Skipping positionHouseRelativeToUI on mobile for Pilots House (image is hidden).');
    }

    // PUBLIC METHOD: Called by core app on initial section show
    handleInitialShow() {
        console.log('🏠 HandleInitialShow called - mobile:', this.isMobile);
        if (this.isMobile) {
            // No need to position house image as it's hidden on mobile.
            // Ensure the house container is indeed hidden on initial mobile load.
            const houseContainer = document.getElementById('pilots-house-container');
            if (houseContainer) {
                houseContainer.style.setProperty('display', 'none', 'important');
                houseContainer.style.setProperty('opacity', '0', 'important');
                houseContainer.style.setProperty('visibility', 'hidden', 'important');
            }
            console.log('🏠 Pilots House image hidden on initial mobile show.');
        }
    }

    goToPrevious() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
        this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
        console.log('Previous image:', this.currentImageIndex);
    }

    goToNext() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
        this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
        console.log('Next image:', this.currentImageIndex);
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
        // Removed: clearTimeout(this.hideUiTimeout); // No longer needed
        
        // Remove event listeners from the container to prevent memory leaks
        const container = document.getElementById('pilots-viewer');
        if (container) {
            container.removeEventListener('mousedown', this.onMouseDown);
            container.removeEventListener('mousemove', this.onMouseMove);
            container.removeEventListener('mouseup', this.onMouseUp);
            container.removeEventListener('wheel', this.onMouseWheel);
            container.removeEventListener('touchstart', this.onTouchStart);
            container.removeEventListener('touchmove', this.onTouchMove);
            container.removeEventListener('touchend', this.onTouchEnd);
        }
        document.removeEventListener('keydown', this.onKeyDown);

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

console.log('🏠 Pilots House Controller with Fixed 360° Images Loaded');