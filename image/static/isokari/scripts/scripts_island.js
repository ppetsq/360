// ===== ISLAND CONTROLLER WITH STARTING POSITION =====
// Handles mirror ball 360° experience with defined starting camera position

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

        // Interaction variables with island starting position
        this.lon = -105;   // Start facing northeast toward the dramatic cliffs
        this.lat = 20;  // Start looking slightly down at the cliffs
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;
        this.isDragging = false;
        this.didZoom = false;

        // Zoom variables with island starting zoom
        this.currentZoom = 110; // Medium-close view of the cliffs
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
            'https://assets.360.petsq.works/isokari/4960/04_4960_7.jpg',
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

    async initialize(app = null) {
        this.app = app; // Store reference for progress updates
        
        try {
            const container = document.getElementById('island-viewer');
            if (!container) {
                throw new Error('Island viewer container not found');
            }
    
            this.createScene(container);
            
            // Show progress while loading first image
            if (this.app) this.app.updateLoadingProgress(25, 'island');
            
            await this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex]);
            
            if (this.app) this.app.updateLoadingProgress(75, 'island');
            
            this.setupEventListeners();
            this.setupMobileUI();
            this.startAnimation();
            
            if (this.autoRotateEnabled) {
                const icon = document.getElementById('auto-rotate-icon');
                this.startIconRotation(icon);
            }
    
            this.setupMapDots();
    
            // Complete
            if (this.app) this.app.updateLoadingProgress(100, 'island');
    
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
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            this.currentZoom,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 0);

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

    async loadEnvironmentTexture(url, showLoading = false) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.crossOrigin = 'anonymous';
    
            let loadingState = null;
            let timeoutId = null;
    
            // ⭐ ENHANCED: Set up delayed loading for image switches
            if (showLoading && this.app) {
                // Start the delay timer - loading will show after 1 second if still loading
                timeoutId = setTimeout(() => {
                    this.app.showImageLoading('Loading new view...');
                    loadingState = 'shown';
                }, 1000); // 1 second delay
            }
    
            loader.load(
                url,
                (texture) => {
                    // ⭐ CRITICAL: Cancel delayed loading if image loads quickly
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    
                    // ⭐ CRITICAL: Hide loading if it was shown
                    if (loadingState === 'shown' && this.app) {
                        this.app.hideImageLoading();
                    }
    
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.flipY = false;
    
                    if (this.currentEnvTexture) {
                        this.currentEnvTexture.dispose();
                    }
                    this.currentEnvTexture = texture;
    
                    if (!this.mirrorBallMesh) {
                        this.createMirrorBallMesh();
                        this.scene.add(this.mirrorBallMesh);
                    } else {
                        this.mirrorBallMesh.material.envMap = this.currentEnvTexture;
                        this.mirrorBallMesh.material.needsUpdate = true;
                    }
    
                    this.updateMapDots();
                    resolve();
                },
                (progress) => {
                    if (progress.total > 0) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        
                        if (showLoading && loadingState === 'shown' && this.app) {
                            // Only update progress if loading overlay is actually shown
                            this.app.updateImageLoadingProgress(percent);
                        } else if (this.app && !ISOKARI.State.initialized.island) {
                            // Update progress during initialization
                            this.app.updateLoadingProgress(25 + Math.round(percent * 0.5), 'island');
                        }
                    }
                },
                (error) => {
                    console.error('Error loading texture:', error);
                    
                    // ⭐ CRITICAL: Clean up on error
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    
                    if (loadingState === 'shown' && this.app) {
                        this.app.hideImageLoading();
                    }
                    
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
                
                if (this.isMobile && this.uiPanelVisible) {
                    setTimeout(() => {
                        this.positionMapRelativeToUI();
                    }, 100);
                }
            });
    
            if (this.isMobile) {
                description.classList.add('collapsed');
                readMoreBtn.textContent = 'Read more';
            }
        }
    
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.updateMapDots();
                
                if (description && readMoreBtn) {
                    if (this.isMobile) {
                        description.classList.add('collapsed');
                        readMoreBtn.textContent = 'Read more';
                    } else {
                        description.classList.remove('collapsed');
                    }
                }
                
                this.resetMapPositioning();
            }
            
            if (this.isMobile && this.uiPanelVisible && wasMobile === this.isMobile) {
                setTimeout(() => {
                    this.positionMapRelativeToUI();
                }, 100);
            }
        });
    }

    resetMapPositioning() {
        const mapContainer = document.getElementById('island-map-container');
        if (!mapContainer) return;
        
        mapContainer.style.removeProperty('bottom');
        mapContainer.style.removeProperty('opacity');
        mapContainer.style.removeProperty('visibility');
        mapContainer.classList.remove('positioned');
        
        console.log(`🔄 RESET MAP POSITIONING - Now ${this.isMobile ? 'MOBILE' : 'DESKTOP'} mode`);
        
        if (this.isMobile && this.uiPanelVisible) {
            setTimeout(() => {
                this.positionMapRelativeToUI();
            }, 100);
        }
    }

    setupEventListeners() {
        const container = document.getElementById('island-viewer');

        container.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        container.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
        container.addEventListener('mouseout', () => this.onMouseUp(), false);
        container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', (e) => this.onTouchEnd(e), false);

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

        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    }

    hideUIPanelImmediately() {
        if (this.uiPanelVisible) {
            this.hideUIPanel();
        }
    }

    onMouseDown(event) {
        if (!event.target.closest('#island-viewer')) {
            return;
        }

        event.preventDefault();
        this.isUserInteracting = true;
        this.isDragging = false;
        this.didZoom = false;

        this.onPointerDownMouseX = event.clientX;
        this.onPointerDownMouseY = event.clientY;
        this.onPointerDownLon = this.lon;
        this.onPointerDownLat = this.lat;

        this.hideUIPanelImmediately();
    }

    onMouseMove(event) {
        if (this.isUserInteracting) {
            const deltaX = (this.onPointerDownMouseX - event.clientX) * this.dragSensitivity;
            const deltaY = (event.clientY - this.onPointerDownMouseY) * this.dragSensitivity;
            
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                this.isDragging = true;
            }

            this.lon = deltaX + this.onPointerDownLon;
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));
        }
    }

    onMouseUp(event) {
        this.isUserInteracting = false;
        this.isDragging = false;
        this.didZoom = false;
    }

    onMouseWheel(event) {
        event.preventDefault();

        this.didZoom = true;
        this.hideUIPanelImmediately();

        const delta = event.deltaY || event.detail || event.wheelDelta;

        if (delta > 0) {
            this.currentZoom = Math.min(this.maxZoom, this.currentZoom + this.zoomSensitivity);
        } else {
            this.currentZoom = Math.max(this.minZoom, this.currentZoom - this.zoomSensitivity);
        }

        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();
    }

    onTouchStart(event) {
        event.preventDefault();

        if (!event.target.closest('#island-viewer')) {
            return;
        }

        this.isUserInteracting = true;
        this.isDragging = false;
        this.didZoom = false;

        if (event.touches.length === 1) {
            this.onPointerDownMouseX = event.touches[0].pageX;
            this.onPointerDownMouseY = event.touches[0].pageY;
            this.onPointerDownLon = this.lon;
            this.onPointerDownLat = this.lat;
        } else if (event.touches.length === 2) {
            this.didZoom = true;
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            this.prevTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
        this.hideUIPanelImmediately();
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isUserInteracting) {
            event.preventDefault();

            const deltaX = (this.onPointerDownMouseX - event.touches[0].pageX) * this.dragSensitivity;
            const deltaY = (event.touches[0].pageY - this.onPointerDownMouseY) * this.dragSensitivity;
            
            if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
                this.isDragging = true;
            }

            this.lon = deltaX + this.onPointerDownLon;
            const newLat = deltaY + this.onPointerDownLat;
            this.lat = Math.max(-this.MAX_LAT_DEG, Math.min(this.MAX_LAT_DEG, newLat));

        } else if (event.touches.length === 2) {
            this.didZoom = true;
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
        this.isDragging = false;
        this.didZoom = false;
    }

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
        this.uiPanelVisible = true;
        const panel = document.getElementById('island-ui-panel');
        const toggleButton = document.getElementById('ui-toggle-button');
        const btqButton = document.getElementById('btq-button');
        const mapContainer = document.getElementById('island-map-container');
    
        panel?.classList.add('visible');
        toggleButton?.classList.add('panel-open');
        mapContainer?.classList.add('visible');
        mapContainer?.classList.remove('positioned');
        
        if (!this.isMobile) {
            btqButton?.classList.add('hidden');
        }
        
        if (this.isMobile) {
            setTimeout(() => {
                this.positionMapRelativeToUI();
            }, 100);
        }
    }

    hideUIPanel() {
        this.uiPanelVisible = false;
        const panel = document.getElementById('island-ui-panel');
        const toggleButton = document.getElementById('ui-toggle-button');
        const btqButton = document.getElementById('btq-button');
        const mapContainer = document.getElementById('island-map-container');
    
        panel?.classList.remove('visible');
        toggleButton?.classList.remove('panel-open');
        mapContainer?.classList.remove('visible');
        mapContainer?.classList.remove('positioned');
        btqButton?.classList.remove('hidden');
        
        if (this.isMobile && mapContainer) {
            mapContainer.style.setProperty('opacity', '0', 'important');
            mapContainer.style.setProperty('visibility', 'hidden', 'important');
        }
    }

    positionMapRelativeToUI() {
        if (!this.isMobile) {
            this.resetMapPositioning();
            return;
        }
        
        const uiPanel = document.getElementById('island-ui-panel');
        const mapContainer = document.getElementById('island-map-container');
        
        if (uiPanel && mapContainer && uiPanel.classList.contains('visible')) {
            const uiHeight = uiPanel.getBoundingClientRect().height;
            const mapHeight = window.innerWidth <= 480 ? 195 : 234;
            const bottomOffset = uiHeight - (mapHeight / 2) + 20;
            
            mapContainer.style.setProperty('bottom', `${bottomOffset}px`, 'important');
            
            setTimeout(() => {
                mapContainer.classList.add('positioned');
                mapContainer.style.setProperty('opacity', '1', 'important');
                mapContainer.style.setProperty('visibility', 'visible', 'important');
            }, 50);
            
            console.log(`🗺️ MOBILE MAP POSITIONING: bottom ${bottomOffset}px`);
        }
    }

    handleInitialShow() {
        console.log('🏝️ HandleInitialShow called - mobile:', this.isMobile);
        if (this.isMobile) {
            setTimeout(() => {
                this.positionMapRelativeToUI();
            }, 600);
        }
    }

    async goToPrevious() {
        const prevIndex = (this.currentImageIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
        await this.navigateToImage(prevIndex);
    }
    
    async goToNext() {
        const nextIndex = (this.currentImageIndex + 1) % this.imageUrls.length;
        await this.navigateToImage(nextIndex);
    }

    async navigateToImage(index) {
        if (index >= 0 && index < this.imageUrls.length && index !== this.currentImageIndex) {
            const oldIndex = this.currentImageIndex;
            this.currentImageIndex = index;
            
            try {
                console.log('Loading image:', this.currentImageIndex);
                // Show delayed loading overlay for image switches
                await this.loadEnvironmentTexture(this.imageUrls[this.currentImageIndex], true);
                console.log('Successfully loaded image:', this.currentImageIndex);
            } catch (error) {
                // If loading fails, revert to previous image
                console.warn('Failed to load image, reverting to previous');
                this.currentImageIndex = oldIndex;
            }
        }
    }

    openBTQ360() {
        window.open('https://btq360.com', '_blank');
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            if (ISOKARI.State.currentSection !== 'island') {
                return;
            }

            if (!this.isUserInteracting && this.autoRotateEnabled) {
                this.lon += this.autoRotateSpeed;
            }

            if (this.mirrorBallMesh) {
                const phi = THREE.MathUtils.degToRad(90 - this.lat);
                const theta = THREE.MathUtils.degToRad(this.lon);
                
                const distance = 3.5;
                
                this.camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
                this.camera.position.y = distance * Math.cos(phi);
                this.camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
                
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

    setupMapDots() {
        const dots = document.querySelectorAll('#island-map-container .dot');
        console.log('Setting up map dots:', dots.length);
        
        dots.forEach((dot, index) => {
            const newDot = dot.cloneNode(true);
            dot.parentNode.replaceChild(newDot, dot);
            
            if (!this.isMobile) {
                newDot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Map dot clicked:', index);
                    this.jumpToImage(index);
                });
            }
        });
        
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

    onKeyDown(event) {
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
        
        const container = document.getElementById('island-viewer');
        if (container) {
            container.removeEventListener('mousedown', this.onMouseDown);
            container.removeEventListener('mousemove', this.onMouseMove);
            container.removeEventListener('mouseup', this.onMouseUp);
            container.removeEventListener('mouseout', this.onMouseUp);
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

    async jumpToImage(index) {
        if (!this.isMobile && index >= 0 && index < this.imageUrls.length && index !== this.currentImageIndex) {
            console.log('Jumping to image via map:', index);
            await this.navigateToImage(index);
        }
    }

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

    resetView() {
        this.lon = 45;   // Start facing northeast toward the dramatic cliffs
        this.lat = -10;  // Start looking slightly down at the cliffs
        this.currentZoom = 85; // Medium-close view of the cliffs
        this.camera.fov = this.currentZoom;
        this.camera.updateProjectionMatrix();
    }
};

console.log('🏝️ Island Controller with Starting Position Loaded');