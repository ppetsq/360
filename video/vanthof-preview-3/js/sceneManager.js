/**
 * Three.js scene management
 */

class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.videoMesh = null;
        this.isInitialized = false;
        this.animationFrameId = null;
        this.container = null;
    }
    
    /**
     * Initialize the 3D scene
     */
    init() {
        // Find container
        this.container = UTILS.dom.getElement('video-container');
        if (!this.container) {
            UTILS.errors.showUserError('Could not find video container');
            return false;
        }
        
        try {
            this.createScene();
            this.createCamera();
            this.createRenderer();
            this.createControls();
            this.setupResizeHandler();
            this.startAnimationLoop();
            this.isInitialized = true;
            return true;
        } catch (error) {
            UTILS.errors.logError(error, 'Scene initialization failed');
            UTILS.errors.showUserError('Failed to initialize 3D viewer');
            return false;
        }
    }
    
    /**
     * Create the Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
    }
    
    /**
     * Create the camera
     */
    createCamera() {
        const { fov, near, far } = CONFIG.camera;
        this.camera = new THREE.PerspectiveCamera(
            fov, 
            window.innerWidth / window.innerHeight, 
            near, 
            far
        );
        
        // Set initial position
        const { x, y, z } = CONFIG.camera.initialPosition;
        this.camera.position.set(x, y, z);
    }
    
    /**
     * Create the WebGL renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }
    
    /**
     * Create orbit controls
     */
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        // Apply settings from config
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.rotateSpeed = CONFIG.camera.rotateSpeed;
        this.controls.zoomSpeed = 1;
        this.controls.minDistance = CONFIG.camera.minDistance;
        this.controls.maxDistance = CONFIG.camera.maxDistance;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = CONFIG.camera.autoRotateSpeed;
    }
    
    /**
     * Handle window resizing
     */
    setupResizeHandler() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Resize handler
     */
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Start animation loop
     */
    startAnimationLoop() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            
            if (this.controls) {
                this.controls.update();
            }
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }
    
    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Create a video sphere from a video element
     */
    createVideoSphere(videoElement, videoTexture) {
        // Remove existing sphere if present
        this.removeVideoSphere();
        
        try {
            // Create sphere geometry
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            geometry.scale(-1, 1, 1); // Invert to show inner surface
            
            // Create material with video texture
            const material = new THREE.MeshBasicMaterial({ map: videoTexture });
            
            // Create mesh and add to scene
            this.videoMesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.videoMesh);
            
            return true;
        } catch (error) {
            UTILS.errors.logError(error, 'Failed to create video sphere');
            return false;
        }
    }
    
    /**
     * Remove and dispose the video sphere
     */
    removeVideoSphere() {
        if (this.videoMesh) {
            this.scene.remove(this.videoMesh);
            UTILS.resources.disposeThreeJSObject(this.videoMesh);
            this.videoMesh = null;
        }
    }
    
    /**
     * Reset camera position
     */
    resetCameraPosition() {
        if (!this.camera || !this.controls) return;
        
        // Save auto-rotation state
        const wasAutoRotating = this.controls.autoRotate;
        
        // Temporarily disable auto-rotation
        this.controls.autoRotate = false;
        
        // Reset position
        const { x, y, z } = CONFIG.camera.initialPosition;
        this.camera.position.set(x, y, z);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Restore auto-rotation
        this.controls.autoRotate = wasAutoRotating;
    }
    
    /**
     * Toggle auto-rotation
     */
    toggleAutoRotate() {
        if (!this.controls) return false;
        
        this.controls.autoRotate = !this.controls.autoRotate;
        return this.controls.autoRotate;
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stopAnimationLoop();
        this.removeVideoSphere();
        
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
            this.renderer = null;
        }
        
        window.removeEventListener('resize', this.handleResize.bind(this));
        
        this.scene = null;
        this.camera = null;
        this.isInitialized = false;
    }
}