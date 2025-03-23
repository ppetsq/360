/**
 * Video management and loading
 */

class VideoManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.videoElement = null;
        this.videoTexture = null;
        this.isPlaying = false;
        this.currentVideoUrl = '';
        this.videoCache = {}; // Cache for preloaded videos
        this.maxCacheSize = 3; // Maximum number of videos to keep in cache
    }
    
    /**
     * Load a video by URL
     */
    /**
 * Load a video by URL
 */
async loadVideo(videoUrl) {
    // Don't reload the same video
    if (videoUrl === this.currentVideoUrl && this.isPlaying) {
        return true;
    }
    
    try {
        this.currentVideoUrl = videoUrl;
        
        // Special handling for iOS devices
        if (UTILS.device.isAnyiOS) {
            return await this.loadVideoForIOS(videoUrl);
        }
        
        // Standard browser handling
        return await this.loadVideoForStandard(videoUrl);
    } catch (error) {
        UTILS.errors.logError(error, `Failed to load video: ${videoUrl}`);
        return false;
    }
}

/**
 * Load video specifically for iOS devices
 */
async loadVideoForIOS(videoUrl) {
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.style.display = 'none';
    videoElement.setAttribute('loop', '');
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    try {
        // Wait for video to load
        await new Promise((resolve, reject) => {
            const loadHandler = () => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                resolve();
            };
            
            const errorHandler = (e) => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                reject(new Error('Video load error: ' + (e.message || 'Unknown error')));
            };
            
            videoElement.addEventListener('loadeddata', loadHandler);
            videoElement.addEventListener('error', errorHandler);
            
            videoElement.load();
        });
        
        // Set current video
        this.videoElement = videoElement;
        
        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        
        // Create video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Play video safely
        await this.videoElement.play().catch(e => {
            console.warn('Auto-play prevented on iOS, waiting for user interaction:', e);
            this.setupPlayOnInteraction();
        });
        
        this.isPlaying = true;
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'iOS video load error');
        return false;
    }
}

/**
 * Load video for standard browsers
 */
async loadVideoForStandard(videoUrl) {
    // Use cache if available
    if (this.videoCache[videoUrl]) {
        this.useVideoFromCache(videoUrl);
        return true;
    }
    
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    try {
        // Wait for video to load
        await this.waitForVideoLoad(videoElement);
        
        // Set current video
        this.videoElement = videoElement;
        
        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.videoElement);
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;
        
        // Create video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Add to cache
        this.addToCache(this.currentVideoUrl, this.videoElement, this.videoTexture);
        
        // Start playback
        await this.play();
        
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'Standard video load error');
        return false;
    }
}
    
    /**
     * Use a video from the cache
     */
    useVideoFromCache(videoUrl) {
        const cachedVideo = this.videoCache[videoUrl];
        
        // Clean up current video
        this.cleanupCurrentVideo();
        
        // Use the cached video
        this.videoElement = cachedVideo.element;
        this.videoTexture = cachedVideo.texture;
        
        // Create new video sphere
        this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
        
        // Start playback
        this.play();
    }
    
    /**
     * Create a video element
     */
/**
 * Create a video element
 */
createVideoElement(videoUrl) {
    // Clean up any existing video
    this.cleanupCurrentVideo();
    
    // Create new video element
    const videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true; // Ensure loop is set to true
    videoElement.muted = true;
    videoElement.playsInline = true;
    
    // Add iOS-specific attributes
    if (UTILS.device.isAnyiOS) {
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
    }
    
    // Hide video element
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
    
    // Set source
    videoElement.src = videoUrl;
    
    return videoElement;
}
    
    /**
     * Wait for video to load
     */
    waitForVideoLoad(videoElement) {
        return new Promise((resolve, reject) => {
            // Set up load event
            const loadHandler = () => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                resolve();
            };
            
            // Set up error event
            const errorHandler = (event) => {
                videoElement.removeEventListener('loadeddata', loadHandler);
                videoElement.removeEventListener('error', errorHandler);
                reject(new Error(`Video load error: ${event.message || 'Unknown error'}`));
            };
            
            // Add event listeners
            videoElement.addEventListener('loadeddata', loadHandler);
            videoElement.addEventListener('error', errorHandler);
            
            // Start loading
            videoElement.load();
            
            // Add timeout for error handling
            setTimeout(() => {
                // If still waiting, trigger error
                if (videoElement.readyState < 2) {
                    errorHandler({ message: 'Video load timeout' });
                }
            }, 20000); // 20 second timeout
        });
    }
    
    /**
     * Set up video after loading
     */
/**
 * Set up video after loading
 */
setupVideo(videoElement) {
    // Clean up current video
    this.cleanupCurrentVideo();
    
    // Set current video
    this.videoElement = videoElement;
    
    // Ensure loop is set
    this.videoElement.loop = true;
    this.videoElement.setAttribute('loop', '');
    
    // Add ended event listener as a backup
    this.videoElement.addEventListener('ended', () => {
        console.log('Video ended, restarting...');
        this.videoElement.currentTime = 0;
        this.videoElement.play().catch(e => console.error('Error restarting video:', e));
    });
    
    // Create video texture
    this.videoTexture = new THREE.VideoTexture(this.videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    
    // Create video sphere
    this.sceneManager.createVideoSphere(this.videoElement, this.videoTexture);
    
    // Add to cache
    this.addToCache(this.currentVideoUrl, this.videoElement, this.videoTexture);
    
    // Start playback
    this.play();
}
    
    /**
     * Add video to cache
     */
    addToCache(url, element, texture) {
        // Check if we need to remove items from cache
        const cacheKeys = Object.keys(this.videoCache);
        if (cacheKeys.length >= this.maxCacheSize) {
            // Find the least recently used video that's not the current one
            const oldestKey = cacheKeys.find(key => key !== this.currentVideoUrl);
            if (oldestKey) {
                this.removeCacheItem(oldestKey);
            }
        }
        
        // Add to cache
        this.videoCache[url] = {
            element: element,
            texture: texture,
            lastUsed: Date.now()
        };
    }
    
    /**
     * Remove item from cache
     */
    removeCacheItem(url) {
        if (this.videoCache[url]) {
            // Don't remove the current video
            if (url === this.currentVideoUrl) return;
            
            const cachedItem = this.videoCache[url];
            
            // Clean up resources
            if (cachedItem.element !== this.videoElement) {
                UTILS.resources.cleanupVideo(cachedItem.element);
            }
            
            delete this.videoCache[url];
        }
    }
    
    /**
     * Play current video
     */
/**
 * Play current video
 */
async play() {
    if (!this.videoElement) return false;
    
    try {
        // Ensure loop is set before playing
        this.videoElement.loop = true;
        
        await this.videoElement.play();
        this.isPlaying = true;
        return true;
    } catch (error) {
        UTILS.errors.logError(error, 'Video play error');
        
        // Try to play on user interaction for Safari/iOS
        this.setupPlayOnInteraction();
        
        return false;
    }
}
    
    /**
     * Set up play-on-interaction handlers for browsers that block autoplay
     */
    setupPlayOnInteraction() {
        const playVideo = () => {
            if (this.videoElement) {
                this.videoElement.play()
                    .then(() => {
                        this.isPlaying = true;
                    })
                    .catch(error => {
                        UTILS.errors.logError(error, 'Play on interaction failed');
                    });
            }
            
            // Remove event listeners
            document.removeEventListener('click', playVideo);
            document.removeEventListener('touchstart', playVideo);
        };
        
        // Add one-time event listeners
        document.addEventListener('click', playVideo, { once: true });
        document.addEventListener('touchstart', playVideo, { once: true });
    }
    
    /**
     * Clean up current video
     */
    cleanupCurrentVideo() {
        // Don't remove from cache, just cleanup references
        if (this.videoElement) {
            // Only pause if this is not a cached video
            if (!Object.values(this.videoCache).some(item => item.element === this.videoElement)) {
                UTILS.resources.cleanupVideo(this.videoElement);
            } else {
                // Just pause it if it's cached
                this.videoElement.pause();
            }
        }
        
        this.videoElement = null;
        this.videoTexture = null;
        this.isPlaying = false;
    }
    
    /**
     * Preload a video
     */
    preloadVideo(videoUrl) {
        // Don't preload if already in cache
        if (this.videoCache[videoUrl]) return;
        
        // Create preload video element
        const preloadVideo = document.createElement('video');
        preloadVideo.crossOrigin = 'anonymous';
        preloadVideo.muted = true;
        preloadVideo.preload = 'auto';
        preloadVideo.style.display = 'none';
        preloadVideo.src = videoUrl;
        document.body.appendChild(preloadVideo);
        
        // Listen for load event
        preloadVideo.addEventListener('loadeddata', () => {
            // Create texture
            const texture = new THREE.VideoTexture(preloadVideo);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            
            // Add to cache
            this.addToCache(videoUrl, preloadVideo, texture);
        });
        
        // Handle load error
        preloadVideo.addEventListener('error', () => {
            UTILS.resources.cleanupVideo(preloadVideo);
        });
        
        // Start loading
        preloadVideo.load();
    }
    
    /**
     * Update video texture
     */
    updateTexture() {
        if (this.videoTexture && this.videoElement && this.videoElement.readyState >= 2) {
            this.videoTexture.needsUpdate = true;
        }
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Clean up current video
        this.cleanupCurrentVideo();
        
        // Clean up cache
        Object.keys(this.videoCache).forEach(url => {
            this.removeCacheItem(url);
        });
        
        this.videoCache = {};
    }
}