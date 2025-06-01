// ===== MENU/INTRO CONTROLLER - BACK TO BASICS =====
// Exact copy of the working version with minimal orientation fix

ISOKARI.MenuController = class {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.videoMesh = null;
        this.video = null;
        this.isUserInteracting = false;
        this.autoRotateEnabled = true;
        
        // Interaction variables
        this.lon = 0;
        this.lat = 0;
        this.onPointerDownLon = 0;
        this.onPointerDownLat = 0;
        this.onPointerDownMouseX = 0;
        this.onPointerDownMouseY = 0;
        
        // Zoom variables (same as island experience)
        this.currentZoom = 75; // Starting zoom for video
        this.minZoom = 50;
        this.maxZoom = 120;
        this.zoomSensitivity = 2;
        
        // Touch variables
        this.touchDistance = 0;
        this.prevTouchDistance = 0;
        
        // Animation settings
        this.autoRotateSpeed = 0.0005;
        this.dragSensitivity = 0.15;
        
        // Animation frame ID
        this.animationId = null;
    }

    async initialize() {
        try {
            const container = document.getElementById('intro-viewer');
            if (!container) {
                throw new Error('Intro viewer container not found');
            }

            await this.createScene(container);
            await this.loadVideo();
            this.setupControls(container);
            this.startAnimation();

            // Store in global state
            ISOKARI.State.scenes.intro = this.scene;
            ISOKARI.State.cameras.intro = this.camera;
            ISOKARI.State.renderers.intro = this.renderer;

            console.log('🎬 Menu controller initialized');
        } catch (error) {
            console.error('Error initializing menu controller:', error);
            // Fallback to gradient background
            this.createFallbackBackground();
        }
    }

    async createScene(container) {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            this.currentZoom, // Use zoom variable instead of fixed 75
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

    async loadVideo() {
        return new Promise((resolve, reject) => {
            // Create video element
            this.video = document.createElement('video');
            this.video.src = 'https://assets.360.petsq.works/isokari/4960/menu.mp4';
            this.video.crossOrigin = 'anonymous';
            this.video.loop = true;
            this.video.muted = true;
            this.video.playsInline = true;
            this.video.preload = 'auto';

            // Video event handlers
            this.video.addEventListener('loadeddata', () => {
                console.log('📹 Video loaded successfully');
                this.createVideoMesh();
                resolve();
            });

            this.video.addEventListener('error', (e) => {
                console.error('Video loading error:', e);
                reject(new Error('Failed to load video'));
            });

            this.video.addEventListener('canplay', () => {
                this.video.play().catch(e => {
                    console.warn('Video autoplay prevented:', e);
                    this.createPlayButton();
                });
            });

            this.video.load();
        });
    }

    createVideoMesh() {
        // Create video texture - EXACTLY like the working version
        const videoTexture = new THREE.VideoTexture(this.video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        videoTexture.flipY = true; // Keep this as it was working

        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1); // Keep this as it was working

        // Create material
        const material = new THREE.MeshBasicMaterial({ 
            map: videoTexture,
            side: THREE.FrontSide
        });

        // Create mesh
        this.videoMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.videoMesh);
    }

    createFallbackBackground() {
        console.log('🎨 Creating fallback gradient background');
        
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a5490');
        gradient.addColorStop(0.3, '#2d7db8');
        gradient.addColorStop(0.6, '#4a9eff');
        gradient.addColorStop(1, '#87ceeb');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 3,
                Math.random() * 3
            );
        }

        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.videoMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.videoMesh);
    }

    createPlayButton() {
        const playButton = document.createElement('button');
        playButton.innerHTML = '▶️ Start Experience';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            cursor: pointer;
            z-index: 1001;
            margin-top: 200px;
            font-family: inherit;
        `;

        playButton.addEventListener('click', () => {
            this.video.play();
            playButton.remove();
        });

        document.getElementById('intro-section').appendChild(playButton);
    }

    setupControls(container) {
        // FIX: Attach mouse events to document instead of just container
        // This allows dragging to continue even when mouse goes over UI elements
        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        document.addEventListener('mouseup', () => this.onMouseUp(), false);
        
        // Keep wheel event on container for zoom
        container.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });

        // Touch events stay on container
        container.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        container.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        container.addEventListener('touchend', () => this.onTouchEnd(), false);
    }

    onMouseDown(event) {
        // Only start interaction if clicking on the viewer, not UI elements
        if (!event.target.closest('#intro-viewer')) {
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
        if (!this.isUserInteracting) return;

        const deltaX = (this.onPointerDownMouseX - event.clientX) * this.dragSensitivity;
        const deltaY = (event.clientY - this.onPointerDownMouseY) * this.dragSensitivity;

        this.lon = deltaX + this.onPointerDownLon;
        this.lat = Math.max(-85, Math.min(85, deltaY + this.onPointerDownLat));
    }

    onMouseUp() {
        this.isUserInteracting = false;
    }

    onMouseWheel(event) {
        event.preventDefault();

        // Add zoom functionality like island experience
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

        if (event.touches.length === 1) {
            this.isUserInteracting = true;
            this.onPointerDownMouseX = event.touches[0].pageX;
            this.onPointerDownMouseY = event.touches[0].pageY;
            this.onPointerDownLon = this.lon;
            this.onPointerDownLat = this.lat;
        } else if (event.touches.length === 2) {
            // Enable pinch-to-zoom on touch devices
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
            // Handle pinch-to-zoom
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

    updateCameraPosition() {
        const phi = THREE.MathUtils.degToRad(90 - this.lat);
        const theta = THREE.MathUtils.degToRad(this.lon);

        this.camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
        this.camera.position.y = 100 * Math.cos(phi);
        this.camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);

        this.camera.lookAt(0, 0, 0);
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            if (ISOKARI.State.currentSection !== 'intro') {
                return;
            }

            if (!this.isUserInteracting && this.autoRotateEnabled) {
                this.lon += this.autoRotateSpeed * 60;
            }

            this.updateCameraPosition();

            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };

        animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    dispose() {
        this.stopAnimation();
        
        // Clean up document event listeners to prevent memory leaks
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        if (this.video) {
            this.video.pause();
            this.video.src = '';
            this.video = null;
        }

        if (this.videoMesh) {
            ISOKARI.Utils.disposeThreeObject(this.videoMesh);
            this.scene?.remove(this.videoMesh);
            this.videoMesh = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
            this.renderer = null;
        }

        this.scene = null;
        this.camera = null;
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

console.log('🎬 Basic Menu Controller Loaded');