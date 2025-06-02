// ===== ISLAND CONTROLLER WITH INITIAL LOAD MAP POSITIONING =====
// Handles mirror ball 360° experience with properly positioned mobile map

ISOKARI.IslandController = class {
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
        this.isMobile = window.innerWidth <= 768;

        // Interaction variables
        this.lon = 0;
        this.lat = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;

        // Zoom variables
        this.currentZoom = 90;
        this.minZoom = 50;
        this.maxZoom = 120;
        this.zoomSensitivity = 2;

        // Touch zoom variables
        this.touchDistance = 0;
        this.prevTouchDistance = 0;

        // Settings
        this.autoRotateSpeed = 0.025;
        this.dragSensitivity = 0.25;

        // Constants for latitude clamping
        this.MAX_LAT_DEG = 84.5;
        this.UP_VECTOR_SMOOTHING_THRESHOLD = 75;

        // Array of image URLs
        this.imageUrls = [
            'https://assets.360.petsq.works/isokari/4960/01_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/02_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/03_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/04_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/05_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/06_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/07_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/08_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/09_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/10_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/11_4960.jpg',
            'https://assets.360.petsq.works/isokari/4960/12_4960.jpg'
        ];
        this.currentImageIndex = 0;
    }

    async initialize() {
        try {
            const container = document.getElementById('island-viewer');
            if (!container) {
                throw new Error('Island viewer container not found');
            }

            this.createScene(container);
            await this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
            this.setupEventListeners();
            this.setupMobileUI();
            this.startAnimation();
            
            if (this.autoRotateEnabled) {
                const icon = document.getElementById('auto-rotate-icon');
                this.startIconRotation(icon);
            }

            // Setup map dots AFTER scene initialization
            this.setupMapDots();

            // Store in global state
            ISOKARI.State.scenes.island = this.scene;
            ISOKARI.State.cameras.island = this.camera;
            ISOKARI.State.renderers.island = this.renderer;

            console.log('🏝️ Island controller initialized');
        } catch (error) {
            console.error('Error initializing island controller:', error);
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

                    // Update map dots after texture load
                    this.updateMapDots();

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

    setupMobileUI() {
        // Setup read more functionality for mobile
        const readMoreBtn = document.getElementById('read-more-btn');
        const description = document.querySelector('.panel-description');
        
        if (readMoreBtn && description) {
            readMoreBtn.addEventListener('click', () => {
                if (description.classList.contains('collapsed')) {
                    description.classList.remove('collapsed');
                    readMoreBtn.textContent = 'Read less';
                } else {
                    description.classList.add('collapsed');
                    readMoreBtn.textContent = 'Read more';
                }
                
                // Reposition map after text change
                if (this.isMobile && this.uiPanelVisible) {
                    setTimeout(() => {
                        this.positionMapRelativeToUI();
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
            
            // If switching between mobile/desktop, update map dots AND reset positioning
            if (wasMobile !== this.isMobile) {
                this.updateMapDots();
                
                // Reset read more state when switching
                if (description && readMoreBtn) {
                    if (this.isMobile) {
                        description.classList.add('collapsed');
                        readMoreBtn.textContent = 'Read more';
                    } else {
                        description.classList.remove('collapsed');
                    }
                }
                
                // CRITICAL: Reset map positioning when switching modes
                this.resetMapPositioning();
            }
            
            // Reposition map on mobile when window resizes (but not when switching modes)
            if (this.isMobile && this.uiPanelVisible && wasMobile === this.isMobile) {
                setTimeout(() => {
                    this.positionMapRelativeToUI();
                }, 100);
            }
        });
    }

    // Add this new method to reset map positioning
resetMapPositioning() {
    const mapContainer = document.getElementById('island-map-container');
    if (!mapContainer) return;
    
    // Remove all JavaScript-applied positioning styles
    mapContainer.style.removeProperty('bottom');
    mapContainer.style.removeProperty('opacity');
    mapContainer.style.removeProperty('visibility');
    
    // Remove positioned class
    mapContainer.classList.remove('positioned');
    
    console.log(`🔄 RESET MAP POSITIONING - Now ${this.isMobile ? 'MOBILE' : 'DESKTOP'} mode`);
    
    // If switching to mobile and UI is visible, reposition after reset
    if (this.isMobile && this.uiPanelVisible) {
        setTimeout(() => {
            this.positionMapRelativeToUI();
        }, 100);
    }
}

    setupEventListeners() {
        const container = document.getElementById('island-viewer');

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

        // Control buttons
        const autoRotateToggle = document.getElementById('auto-rotate-toggle');
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        const uiToggleButton = document.getElementById('ui-toggle-button');
        const btqButton = document.getElementById('btq-button');

        if (autoRotateToggle) autoRotateToggle.addEventListener('click', () => this.toggleAutoRotate());
        if (prevButton) prevButton.addEventListener('click', () => this.goToPrevious());
        if (nextButton) nextButton.addEventListener('click', () => this.goToNext());
        if (uiToggleButton) uiToggleButton.addEventListener('click', () => this.toggleUIPanel());
        if (btqButton) btqButton.addEventListener('click', () => this.openBTQ360());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    }

    // Mouse interaction handlers
    onMouseDown(event) {
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

    // Touch interaction handlers
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

    // UI Controls
    toggleAutoRotate() {
        const button = document.getElementById('auto-rotate-toggle');
        const icon = document.getElementById('auto-rotate-icon');

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
        const panel = document.getElementById('island-ui-panel');
        const toggleButton = document.getElementById('ui-toggle-button');
        const btqButton = document.getElementById('btq-button');
        const mapContainer = document.getElementById('island-map-container');
    
        panel?.classList.add('visible');
        toggleButton?.classList.add('panel-open');
        mapContainer?.classList.add('visible');
        
        // Remove positioned class when showing (reset state)
        mapContainer?.classList.remove('positioned');
        
        // Only hide BTQ button on desktop
        if (!this.isMobile) {
            btqButton?.classList.add('hidden');
        }
        
        this.uiPanelVisible = true;
        
        // MOBILE: Position map after UI is shown and rendered
        if (this.isMobile) {
            // Wait for UI to finish rendering, then position map
            setTimeout(() => {
                this.positionMapRelativeToUI();
            }, 100);
        }
    }

    hideUIPanel() {
        const panel = document.getElementById('island-ui-panel');
        const toggleButton = document.getElementById('ui-toggle-button');
        const btqButton = document.getElementById('btq-button');
        const mapContainer = document.getElementById('island-map-container');
    
        panel?.classList.remove('visible');
        toggleButton?.classList.remove('panel-open');
        mapContainer?.classList.remove('visible');
        mapContainer?.classList.remove('positioned'); // Clean up positioned class
        btqButton?.classList.remove('hidden');
        
        // MOBILE: Ensure map is hidden when UI is hidden
        if (this.isMobile && mapContainer) {
            mapContainer.style.setProperty('opacity', '0', 'important');
            mapContainer.style.setProperty('visibility', 'hidden', 'important');
        }
        
        this.uiPanelVisible = false;
    }

    positionMapRelativeToUI() {
        if (!this.isMobile) {
            // If not mobile, ensure we're not applying mobile positioning
            this.resetMapPositioning();
            return;
        }
        
        const uiPanel = document.getElementById('island-ui-panel');
        const mapContainer = document.getElementById('island-map-container');
        
        if (uiPanel && mapContainer && uiPanel.classList.contains('visible')) {
            const uiHeight = uiPanel.getBoundingClientRect().height;
            const mapHeight = 187; // Your mobile map height
            
            // Position map so it's 50/50 above UI panel and overlapping, raised by 20px
            const bottomOffset = uiHeight - (mapHeight / 2) + 20;
            
            // FIRST: Position the map (while it's still hidden)
            mapContainer.style.setProperty('bottom', `${bottomOffset}px`, 'important');
            
            // THEN: Add positioned class and show after positioning is complete
            setTimeout(() => {
                mapContainer.classList.add('positioned'); // Add positioned class
                mapContainer.style.setProperty('opacity', '1', 'important');
                mapContainer.style.setProperty('visibility', 'visible', 'important');
            }, 50); // Small delay to ensure position is set first
            
            console.log(`🗺️ MOBILE MAP POSITIONING:`);
            console.log(`UI Height: ${uiHeight}px`);
            console.log(`Map positioned at bottom: ${bottomOffset}px`);
        } else {
            console.log(`❌ MAP POSITIONING FAILED:`);
            console.log(`isMobile: ${this.isMobile}`);
            console.log(`uiPanel:`, uiPanel);
            console.log(`mapContainer:`, mapContainer);
            console.log(`UI panel visible:`, uiPanel?.classList.contains('visible'));
        }
    }

    // PUBLIC METHOD: Called by core app on initial section show
    handleInitialShow() {
        console.log('🏝️ HandleInitialShow called - mobile:', this.isMobile);
        if (this.isMobile) {
            // Position map on initial show with proper delay
            setTimeout(() => {
                console.log('🏝️ Attempting initial map positioning...');
                this.positionMapRelativeToUI();
            }, 600); // Longer delay to ensure UI is fully rendered
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

    // Animation loop
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            // Only animate if this is the current section
            if (ISOKARI.State.currentSection !== 'island') {
                return;
            }

            // Auto-rotation when not interacting
            if (!this.isUserInteracting && this.autoRotateEnabled) {
                this.lon += this.autoRotateSpeed;
            }

            // Update camera position based on lat/lon
            if (this.mirrorBallMesh) {
                const phi = THREE.MathUtils.degToRad(90 - this.lat);
                const theta = THREE.MathUtils.degToRad(this.lon);
                
                const distance = 3.5;
                
                this.camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
                this.camera.position.y = distance * Math.cos(phi);
                this.camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
                
                // Camera up vector stabilization for smooth pole navigation
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

    // Map dot functionality with mobile optimizations
    setupMapDots() {
        const dots = document.querySelectorAll('#island-map-container .dot');
        console.log('Setting up map dots:', dots.length);
        
        dots.forEach((dot, index) => {
            // Clear any existing event listeners by cloning the node
            const newDot = dot.cloneNode(true);
            dot.parentNode.replaceChild(newDot, dot);
            
            // Only add click events on desktop
            if (!this.isMobile) {
                newDot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Map dot clicked:', index);
                    this.jumpToImage(index);
                });
            }
        });
        
        // Initial update of active dot
        this.updateMapDots();
    }
    
    updateMapDots() {
        const dots = document.querySelectorAll('#island-map-container .dot');
        
        dots.forEach((dot, index) => {
            if (index === this.currentImageIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Keyboard controls
    onKeyDown(event) {
        // Only handle if we're in the island section
        if (ISOKARI.State.currentSection !== 'island') return;

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

    // Jump to image method (desktop only)
    jumpToImage(index) {
        if (!this.isMobile && index >= 0 && index < this.imageUrls.length && index !== this.currentImageIndex) {
            console.log('Jumping to image via map:', index);
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

console.log('🏝️ Island Controller with Initial Load Map Positioning Loaded');