/**
 * Van 't Hof Production Line 360° Experience
 * Optimized and simplified Three.js implementation
 */

// Viewpoint configuration
const viewpoints = [
    {
        id: 0,
        title: "Preparation",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth1_edit.mp4",
        description: "Fresh and locally produced ingredients form the base of our spring rolls. We select quality components that create our signature rich flavor."
    },
    {
        id: 1,
        title: "Processing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth2_edit.mp4",
        description: "Advanced processing transforms raw ingredients into premium food products using state-of-the-art machinery."
    },
    {
        id: 2,
        title: "Quality Control",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth3_edit.mp4",
        description: "We check every batch carefully to make sure it meets our standards. Testing process guarantees quality in every spring roll we deliver."
    },
    {
        id: 3,
        title: "Pre-baking",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth4_edit.mp4",
        description: "Our pre-baking and flash-freezing process ensures reliable quality for retailers and consistent taste for consumers."
    },
    {
        id: 4,
        title: "Packaging",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth5_edit.mp4",
        description: "Our spring rolls are packaged with 2 rolls per 400g retail unit. These are then organized into carton delivery boxes, each containing 8 units."
    },
    {
        id: 5,
        title: "Labeling",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth6_edit.mp4",
        description: "We provide white-label solutions, delivering products that are retail-ready while maintaining food safety standards throughout the entire process."
    }
];

const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isIOSChrome = isIOSDevice && /CriOS/i.test(navigator.userAgent);
const isIOSSafari = isIOSDevice && /Version\//.test(navigator.userAgent) && !isIOSChrome;
const isAnyiOS = isIOSDevice;

// Global state variables
let currentViewpointIndex = 0;
let isAutoRotating = false;
let isUIHidden = false;
let lastTapTime = 0;
let scene, camera, renderer, controls;
let videoElement, videoTexture, videoMaterial, videoMesh;
let initialLoadComplete = false;
let hasHiddenUIBefore = false;

// Initialize the experience
function init() {
    // Ensure UI is visible on initial load
    document.body.classList.add('ui-visible');
    
    // Show initial description and title
    updateViewpointInfo();
    
    // Show loader
    showLoader();
    
    // Set up Three.js scene
    setupThreeJS();
    
    // Create first video sphere
    loadVideoSphere(viewpoints[currentViewpointIndex].videoUrl);
    
    // Set up event listeners
    setupEventListeners();

    // Make sure fade overlay is transparent after initial load
    setTimeout(() => {
        document.getElementById('fade-overlay').style.opacity = '0';
    }, 1000);
}

function modifyInitForIOS() {
    if (isIOSChrome && videoElement) {
        prepareVideoForIOS(videoElement);
        // For iOS Chrome, add extra event listeners for initial playback
        document.addEventListener('touchstart', () => {
            if (videoElement) videoElement.play().catch(e => console.log('Initial play error:', e));
        }, { once: true });
    }
}

function enhanceInitForMobile() {
    if (isAnyiOS && videoElement) {
        // Add extra iOS attributes to initial video
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
        
        // For iOS, ensure we have user interaction to start videos
        const initialPlayHandler = () => {
            if (videoElement) {
                videoElement.play().catch(e => console.log('Initial play error:', e));
            }
        };
        
        document.addEventListener('touchstart', initialPlayHandler, { once: true });
    }
}

// Set up Three.js scene
function setupThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(100, 20, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    const container = document.getElementById('video-container');
    container.appendChild(renderer.domElement);
    
    // Set up OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1;
    controls.minDistance = 5;
    controls.maxDistance = 300;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Update video texture if available
    if (videoTexture && videoElement && videoElement.readyState >= 2) {
        videoTexture.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

// Load video sphere - only used for initial loading
function loadVideoSphere(videoUrl) {
    showLoader();
    
    // Clean up previous video if it exists
    if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
        document.body.removeChild(videoElement);
    }
    
    // Create video element
    videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.display = 'none'; // Hide the video element
    document.body.appendChild(videoElement);
    
    videoElement.src = videoUrl;
    
    // Handle video loaded
    videoElement.addEventListener('loadeddata', () => {
        createVideoSphere();
        
        // Play video and fade in UI
        videoElement.play().then(() => {
            document.body.classList.add('ui-visible');
            document.querySelector('.description-content').style.opacity = '1';
            
            // Only hide loader after video has started playing
            hideLoader();
            
            // Ensure fade overlay is gone after initial load
            if (!initialLoadComplete) {
                initialLoadComplete = true;
                document.getElementById('fade-overlay').style.opacity = '0';
            }
        }).catch(error => {
            console.error('Error playing video:', error);
            // Try one more time after user interaction
            document.addEventListener('click', () => {
                videoElement.play().catch(console.error);
            }, { once: true });
        });
    });
    
    // Handle errors
    videoElement.addEventListener('error', () => {
        console.error('Video load error');
        showErrorMessage('Error loading video');
    });
    
    videoElement.load();
}

// Create video sphere
function createVideoSphere() {
    // Clean up previous mesh
    if (videoMesh) {
        scene.remove(videoMesh);
        if (videoMaterial) {
            videoMaterial.map?.dispose();
            videoMaterial.dispose();
        }
    }
    
    // Create video texture
    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    
    // Create material with video texture
    videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    
    // Create mesh and add to scene
    videoMesh = new THREE.Mesh(geometry, videoMaterial);
    scene.add(videoMesh);
}

// Set up event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('prev-viewpoint').addEventListener('click', goToPreviousViewpoint);
    document.getElementById('next-viewpoint').addEventListener('click', goToNextViewpoint);
    
    // Viewpoint indicator dots
    document.querySelectorAll('.viewpoint-dot').forEach(dot => {
        dot.addEventListener('click', () => changeViewpoint(parseInt(dot.dataset.index)));
    });
    
    // Auto-rotate button
    document.getElementById('btn-auto-rotate').addEventListener('click', toggleAutoRotate);
    
    // Hide UI button
    document.getElementById('btn-hide-ui').addEventListener('click', toggleUI);
    
    // Double tap/click to toggle UI
    document.addEventListener('touchstart', handleDoubleTap);
    document.addEventListener('click', handleDoubleClick);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add an initial interaction handler to ensure video playback on iOS devices
    const initialInteractionHandler = () => {
        if (videoElement) {
            videoElement.play().catch(console.error);
        }
        document.removeEventListener('touchstart', initialInteractionHandler);
        document.removeEventListener('click', initialInteractionHandler);
    };
    
    document.addEventListener('touchstart', initialInteractionHandler);
    document.addEventListener('click', initialInteractionHandler);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Toggle auto-rotation
function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    controls.autoRotate = isAutoRotating;
    document.getElementById('btn-auto-rotate').classList.toggle('active', isAutoRotating);
}

// Toggle UI visibility
function toggleUI() {
    isUIHidden = !isUIHidden;
    
    if (isUIHidden) {
        document.body.classList.remove('ui-visible');
        document.body.classList.add('ui-hidden');
        
        // Show notification only if this is the first time hiding the UI
        if (!hasHiddenUIBefore) {
            const notification = document.getElementById('ui-hidden-notification');
            if (notification) {
                notification.style.opacity = '1';
                
                // Hide the notification after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = '0';
                }, 3000);
                
                // Update the flag so we don't show it again
                hasHiddenUIBefore = true;
            }
        }
    } else {
        document.body.classList.remove('ui-hidden');
        document.body.classList.add('ui-visible');
        
        // Ensure description is visible when UI is shown
        document.querySelector('.description-content').style.opacity = '1';
        
        // Immediately hide the notification when controls are shown
        const notification = document.getElementById('ui-hidden-notification');
        if (notification) {
            notification.style.opacity = '0';
        }
    }
}

// Navigate to previous viewpoint
function goToPreviousViewpoint() {
    const newIndex = currentViewpointIndex > 0 
        ? currentViewpointIndex - 1 
        : viewpoints.length - 1;
    changeViewpoint(newIndex);
}

// Navigate to next viewpoint
function goToNextViewpoint() {
    const newIndex = currentViewpointIndex < viewpoints.length - 1 
        ? currentViewpointIndex + 1 
        : 0;
    changeViewpoint(newIndex);
}

// Change viewpoint
function changeViewpoint(index) {
    if (index === currentViewpointIndex) return;
    
    currentViewpointIndex = index;
    updateViewpointInfo();
    
    // Fade effect
    const fadeOverlay = document.getElementById('fade-overlay');
    fadeOverlay.style.opacity = '1';
    
    // Universal approach for all iOS devices
    if (isAnyiOS) {
        setTimeout(() => {
            // Clean up previous video if it exists
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
                if (videoElement.parentNode) {
                    videoElement.parentNode.removeChild(videoElement);
                }
            }
            
            // Create a fresh video element for iOS
            videoElement = document.createElement('video');
            videoElement.crossOrigin = 'anonymous';
            videoElement.loop = true;
            videoElement.muted = true;
            videoElement.playsInline = true;
            videoElement.setAttribute('playsinline', '');
            videoElement.setAttribute('webkit-playsinline', '');
            videoElement.style.display = 'none';
            
            document.body.appendChild(videoElement);
            
            // Set the video source
            videoElement.src = viewpoints[currentViewpointIndex].videoUrl;
            
            // Standard loadedmetadata handler
            videoElement.addEventListener('loadeddata', function onLoadedData() {
                // Create the video sphere once we have metadata
                createVideoSphere();
                
                // Try to play the video
                const playPromise = videoElement.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // Transition timing
                        const transitionDelay = isIOSSafari ? 100 : 50;
                        
                        // Success - fade in the content
                        setTimeout(() => {
                            fadeOverlay.style.opacity = '0';
                            document.body.classList.add('ui-visible');
                            document.querySelector('.description-content').style.opacity = '1';
                        }, transitionDelay);
                    }).catch(error => {
                        console.error('Video play error:', error);
                        
                        // Even if play fails, still fade in
                        fadeOverlay.style.opacity = '0';
                        
                        // Set up a user interaction handler to try again
                        const resumePlayback = () => {
                            videoElement.play().catch(e => console.log('Play error after interaction:', e));
                        };
                        
                        document.addEventListener('touchstart', resumePlayback, { once: true });
                        document.addEventListener('click', resumePlayback, { once: true });
                    });
                } else {
                    // Older browsers might not return a promise
                    fadeOverlay.style.opacity = '0';
                }
                
                // Remove this listener to avoid memory leaks
                videoElement.removeEventListener('loadeddata', onLoadedData);
            });
            
            // Error handling
            videoElement.addEventListener('error', (e) => {
                console.error('Video load error:', e);
                fadeOverlay.style.opacity = '0';
            });
            
            // Start loading the video
            videoElement.load();
            
        }, 500); // Keep the standard fade duration
    } else {
        // Original code for non-iOS browsers
        setTimeout(() => {
            // Safari-specific fix: longer fade duration
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const transitionTime = isSafari ? 800 : 500;
            
            // Don't show the loader for viewpoint changes
            const videoUrl = viewpoints[currentViewpointIndex].videoUrl;
            
            // Preload the next video
            const preloadVideo = document.createElement('video');
            preloadVideo.crossOrigin = 'anonymous';
            preloadVideo.loop = true;
            preloadVideo.muted = true;
            preloadVideo.playsInline = true;
            preloadVideo.style.display = 'none';
            preloadVideo.src = videoUrl;
            preloadVideo.preload = 'auto';
            document.body.appendChild(preloadVideo);
            
            // Clean up previous video if it exists
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
                document.body.removeChild(videoElement);
            }
            
            // Use the preloaded video
            videoElement = preloadVideo;
            
            // Wait for enough data before showing
            const prepareVideo = () => {
                if (videoElement.readyState >= 3) {
                    // We have enough data to start playing
                    createVideoSphere();
                    
                    videoElement.play().then(() => {
                        // Give a small delay before fading in (especially for Safari)
                        setTimeout(() => {
                            // Fade out the overlay
                            fadeOverlay.style.opacity = '0';
                            fadeOverlay.style.transition = `opacity ${transitionTime}ms ease`;
                            
                            // Ensure description is visible
                            document.body.classList.add('ui-visible');
                            document.querySelector('.description-content').style.opacity = '1';
                            
                            // Reset transition after fade completes
                            setTimeout(() => {
                                fadeOverlay.style.transition = 'opacity 0.5s ease';
                            }, transitionTime);
                        }, isSafari ? 100 : 0);
                    }).catch(error => {
                        console.error('Error playing video:', error);
                        // Try one more time after user interaction
                        document.addEventListener('click', () => {
                            videoElement.play().catch(console.error);
                            fadeOverlay.style.opacity = '0';
                        }, { once: true });
                    });
                    
                    videoElement.removeEventListener('canplaythrough', prepareVideo);
                }
            };
            
            if (videoElement.readyState >= 3) {
                // Video is already loaded enough
                prepareVideo();
            } else {
                // Wait for the video to load
                videoElement.addEventListener('canplaythrough', prepareVideo);
            }
            
            // Handle errors
            videoElement.addEventListener('error', () => {
                console.error('Video load error');
                fadeOverlay.style.opacity = '0';
            });
        }, 500);
    }
}

// Update viewpoint information
function updateViewpointInfo() {
    const currentViewpoint = viewpoints[currentViewpointIndex];
    
    // Update title and description
    document.getElementById('viewpoint-title').textContent = currentViewpoint.title;
    document.getElementById('description-text').textContent = currentViewpoint.description;
    
    // Ensure description is visible
    const descriptionContent = document.querySelector('.description-content');
    if (descriptionContent) {
        descriptionContent.style.opacity = '1';
    }
    
    // Update indicator dots
    document.querySelectorAll('.viewpoint-dot').forEach(dot => {
        dot.classList.toggle('active', parseInt(dot.dataset.index) === currentViewpointIndex);
    });
}

// Handle double tap for mobile
function handleDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    // Detect double tap (within 300ms)
    if (tapLength < 300 && tapLength > 0) {
        // Prevent toggling UI if tapping on UI elements
        const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
        
        if (!isOnUIElement) {
            toggleUI();
            event.preventDefault();
        }
    }
    
    lastTapTime = currentTime;
}

// Handle double click for desktop
function handleDoubleClick(event) {
    const currentTime = new Date().getTime();
    const clickLength = currentTime - lastTapTime;
    
    // Detect double click (within 300ms)
    if (clickLength < 300 && clickLength > 0) {
        // Prevent toggling UI if clicking on UI elements
        const isOnUIElement = !!event.target.closest('button, .viewpoint-dot, .logo');
        
        if (!isOnUIElement) {
            toggleUI();
            event.preventDefault();
        }
    }
    
    lastTapTime = currentTime;
}

// Handle keyboard navigation
function handleKeyPress(event) {
    // Prevent scrolling with arrow keys and space
    if ([27, 32, 37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // Remove focus from any button that might be focused
    if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
    }
    
    switch (event.keyCode) {
        // Left arrow key
        case 37:
            goToPreviousViewpoint();
            break;
            
        // Right arrow key
        case 39:
            goToNextViewpoint();
            break;
            
        // Space bar
        case 32:
            toggleAutoRotate();
            // Visual feedback for space bar press
            const rotateButton = document.getElementById('btn-auto-rotate');
            rotateButton.classList.add('pressed');
            setTimeout(() => {
                rotateButton.classList.remove('pressed');
            }, 200);
            break;
            
        // Escape key
        case 27:
            toggleUI();
            // Visual feedback for escape key press
            const hideButton = document.getElementById('btn-hide-ui');
            hideButton.classList.add('pressed');
            setTimeout(() => {
                hideButton.classList.remove('pressed');
            }, 200);
            break;
    }
}

// Show loader
function showLoader() {
    const loader = document.getElementById('custom-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
}

// Hide loader
function hideLoader() {
    const loader = document.getElementById('custom-loader');
    
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            
            // Show UI elements
            setTimeout(() => {
                const uiOverlay = document.querySelector('.ui-overlay');
                const logoContainer = document.querySelector('.logo-container');
                
                if (uiOverlay) uiOverlay.style.opacity = '1';
                if (logoContainer) logoContainer.style.opacity = '1';
                
                // Ensure description is visible
                const descriptionContent = document.querySelector('.description-content');
                if (descriptionContent) {
                    descriptionContent.style.opacity = '1';
                }
                
                // Remove loader from DOM
                loader.style.display = 'none';
            }, 500);
        }, 500);
    }
}

// Show error message
function showErrorMessage(message) {
    const loader = document.getElementById('custom-loader');
    if (loader) {
        loader.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
                <h2>Error Loading 360° Experience</h2>
                <p>${message}</p>
                <button onclick="location.reload()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                    padding: 10px 20px; margin-top: 20px; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
        loader.style.opacity = '1';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Helper function to safely play videos with iOS compatibility
function safePlayVideo(videoElem) {
    // For iOS browsers, especially Chrome
    if (videoElem) {
        const playPromise = videoElem.play();
        if (playPromise !== undefined) {
            return playPromise.catch(error => {
                console.warn('Auto-play prevented, waiting for user interaction.', error);
                // Set an event handler for user interaction
                const userInteractionHandler = () => {
                    videoElem.play().catch(e => console.error('Play error even after interaction:', e));
                    document.removeEventListener('touchstart', userInteractionHandler);
                    document.removeEventListener('click', userInteractionHandler);
                };
                document.addEventListener('touchstart', userInteractionHandler, { once: true });
                document.addEventListener('click', userInteractionHandler, { once: true });
                throw error; // Re-throw to maintain promise rejection
            });
        }
        return Promise.resolve(); // For browsers where play() doesn't return a promise
    }
    return Promise.reject('No video element provided');
}

// Helper to prepare video elements for iOS Chrome
function prepareVideoForIOS(videoElem) {
    if (!videoElem) return videoElem;
    
    // Apply iOS-specific attributes
    videoElem.setAttribute('playsinline', '');
    videoElem.setAttribute('webkit-playsinline', '');
    videoElem.setAttribute('muted', '');
    videoElem.muted = true;
    
    return videoElem;
}