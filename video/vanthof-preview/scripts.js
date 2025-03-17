/**
 * Van 't Hof Production Line 360° Experience
 * Alternative implementation using Three.js directly for 360° video
 */

// Define the viewpoints with their metadata
const viewpoints = [
    {
        id: 0,
        title: "Preparation",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth1.mp4",
        description: "The journey begins in our meticulously organized preparation area. Here, raw ingredients are carefully selected, inspected, and prepared for processing. Our team ensures only the highest quality materials make it to the next stage."
    },
    {
        id: 1,
        title: "Processing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth2.mp4",
        description: "Advanced processing transforms raw ingredients into premium food products. Our state-of-the-art machinery precisely cuts, mixes, and transforms ingredients while maintaining optimal temperature and quality standards."
    },
    {
        id: 2,
        title: "Quality Control",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth3.mp4",
        description: "Rigorous quality control is the heart of our production. Each batch undergoes comprehensive testing, from visual inspections to advanced chemical and microbiological analyses, ensuring every product meets our exceptional standards."
    },
    {
        id: 3,
        title: "Packaging",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth4.mp4",
        description: "Precision packaging preserves the integrity of our products. Automated systems carefully seal and package each item, protecting freshness and quality while minimizing environmental impact through sustainable packaging solutions."
    },
    {
        id: 4,
        title: "Storage",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth5.mp4",
        description: "Our advanced storage facilities maintain optimal conditions for product preservation. Carefully controlled temperature, humidity, and lighting ensure that every product remains in perfect condition from production to delivery."
    },
    {
        id: 5,
        title: "Shipping",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth6.mp4",
        description: "The final stage of our production journey. Products are carefully loaded and dispatched using our sophisticated logistics network, ensuring timely and precise delivery to customers while maintaining the highest standards of food safety."
    }
];

// Global variables
let currentViewpointIndex = 0;
let isAutoRotating = false;
let isUIHidden = false;
let lastTapTime = 0;
let hasShownUIHiddenNotice = false; // Track if we've shown the notification before

// Three.js variables
let scene, camera, renderer;
let videoElement, videoTexture, videoMaterial, videoMesh;
let controls;
let animationId = null;

// Cache for preloaded videos
const preloadedVideos = {};

// Initialize the viewer
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Show loader
    const loader = document.getElementById('custom-loader');
    if (loader) loader.style.opacity = '1';
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Create first video sphere
    createVideoSphere(viewpoints[currentViewpointIndex].videoUrl);
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI
    updateViewpointInfo();
    
    // Preload next video
    preloadNextVideo();
    
    // Add event listeners for touch events to support pinch zooming
    setupZoomListeners();
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 0.1); // Slight offset to avoid rendering issues

        // Set the default zoom level by adjusting the camera position
    // Lower number = more zoomed in, Higher number = more zoomed out
    const defaultZoomDistance = 150; // Adjust this value to change default zoom
    camera.position.set(0, 0, defaultZoomDistance);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    const container = document.getElementById('video-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // Add OrbitControls with zoom enabled
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;        // Enable zoom
    controls.enablePan = true;        // Disable panning
    controls.rotateSpeed = 0.5;        // Rotation speed
    controls.zoomSpeed = 5;          // Zoom speed - slightly increased for better UX
    controls.minDistance = 5;          // Minimum zoom distance (zoomed in)
    controls.maxDistance = 500;        // Maximum zoom distance (zoomed out)
    controls.autoRotate = false;       // Auto-rotate off by default
    controls.autoRotateSpeed = 0.5;    // Auto-rotate speed
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function setupZoomListeners() {
    // Add handlers for touch events to better support pinch zooming
    const container = document.getElementById('video-container');
    if (!container) return;
    
    // Track touch events
    let initialPinchDistance = 0;
    let isPinching = false;
    
    // Touch start event - detect pinch start
    container.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // Calculate initial distance between two fingers
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            isPinching = true;
        }
    });
    
    // Touch move event - handle pinch zoom
    container.addEventListener('touchmove', function(e) {
        if (isPinching && e.touches.length === 2) {
            // Calculate current distance
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            
            // Calculate zoom factor
            const pinchRatio = currentDistance / initialPinchDistance;
            
            // Apply zoom by updating camera position
            if (controls) {
                // Apply zoom based on pinch ratio
                if (pinchRatio > 1) {
                    controls.dollyOut(pinchRatio * 0.5);
                } else if (pinchRatio < 1) {
                    controls.dollyIn((1/pinchRatio) * 0.5);
                }
                
                // Update controls
                controls.update();
                
                // Reset initial distance for next move
                initialPinchDistance = currentDistance;
            }
            
            // Prevent default to avoid page zooming
            e.preventDefault();
        }
    });
    
    // Touch end event - reset pinch state
    container.addEventListener('touchend', function() {
        isPinching = false;
    });
    
    // Touch cancel event - reset pinch state
    container.addEventListener('touchcancel', function() {
        isPinching = false;
    });
    
    // Add zoom instructions for first-time users
    const notification = document.getElementById('ui-hidden-notification');
    if (notification) {
        // Create a new notification for zoom
        const zoomNotification = document.createElement('div');
        zoomNotification.id = 'zoom-notification';
        zoomNotification.textContent = 'Scroll or pinch to zoom';
        
        // Copy styles from the other notification
        zoomNotification.className = 'notification';
        document.body.appendChild(zoomNotification);
        
        // Show zoom notification briefly after load
        setTimeout(function() {
            zoomNotification.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(function() {
                zoomNotification.style.opacity = '0';
            }, 3000);
        }, 2000); // Delay showing until after initial load
    }
}

function createVideoSphere(videoUrl) {
    // Create video element if not preloaded
    if (preloadedVideos[videoUrl]) {
        videoElement = preloadedVideos[videoUrl];
        setupVideoSphere();
        // Ensure video is playing
        videoElement.play().catch(e => {
            console.warn('Autoplay prevented:', e);
            // Add manual play handler on user interaction
            document.body.addEventListener('click', function bodyClick() {
                videoElement.play();
                document.body.removeEventListener('click', bodyClick);
            }, { once: true });
        });
    } else {
        videoElement = document.createElement('video');
        videoElement.crossOrigin = 'anonymous';
        videoElement.loop = true;
        videoElement.muted = true; // Always muted since there's no audio
        videoElement.playsInline = true;
        videoElement.src = videoUrl;
        
        // Wait for video to be loaded
        videoElement.addEventListener('loadeddata', function() {
            // Cache the video
            preloadedVideos[videoUrl] = videoElement;
            
            // Set up video sphere
            setupVideoSphere();
            
            // Ensure video is playing
            videoElement.play().catch(e => {
                console.warn('Autoplay prevented:', e);
                // Add manual play handler on user interaction
                document.body.addEventListener('click', function bodyClick() {
                    videoElement.play();
                    document.body.removeEventListener('click', bodyClick);
                }, { once: true });
            });
            
            // Hide loader
            hideLoader();
        });
        
        // Handle video error
        videoElement.addEventListener('error', function(e) {
            console.error('Video error:', e);
            showErrorMessage('Error loading video: ' + videoUrl);
        });
        
        // Start loading
        videoElement.load();
    }
}

function setupVideoSphere() {
    // Remove existing video mesh if any
    if (videoMesh) {
        scene.remove(videoMesh);
        videoMaterial.dispose();
        videoTexture.dispose();
    }
    
    // Create video texture
    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    
    // Create spherical geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert the sphere to show video on the inside
    
    // Create material with video texture
    videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    
    // Create mesh
    videoMesh = new THREE.Mesh(geometry, videoMaterial);
    
    // Add to scene
    scene.add(videoMesh);
    
    // Play video
    videoElement.play().catch(e => {
        console.warn('Autoplay prevented:', e);
    });
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

function setupEventListeners() {
    // Navigation buttons
    const prevButton = document.getElementById('prev-viewpoint');
    if (prevButton) {
        prevButton.addEventListener('click', goToPreviousViewpoint);
    }
    
    const nextButton = document.getElementById('next-viewpoint');
    if (nextButton) {
        nextButton.addEventListener('click', goToNextViewpoint);
    }
    
    // Viewpoint indicator dots
    const dots = document.querySelectorAll('.viewpoint-dot');
    for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', function() {
            changeViewpoint(parseInt(this.dataset.index));
        });
    }
    
    // Auto rotate button
    const autoRotateButton = document.getElementById('btn-auto-rotate');
    if (autoRotateButton) {
        autoRotateButton.addEventListener('click', toggleAutoRotate);
    }
    
    // Hide UI button
    const hideUIButton = document.getElementById('btn-hide-ui');
    if (hideUIButton) {
        hideUIButton.addEventListener('click', toggleUI);
    }
    
    // Double tap for mobile - document level event listener
    document.addEventListener('touchstart', handleDoubleTap);
    
    // Double click for desktop users
    let lastClickTime = 0;
    document.addEventListener('click', function(event) {
        const currentTime = new Date().getTime();
        const clickLength = currentTime - lastClickTime;
        
        // Double click (within 300ms)
        if (clickLength < 300 && clickLength > 0) {
            // Check if we clicked on interactive elements
            let isInteractiveElement = false;
            
            if (event.target.closest) {
                isInteractiveElement = 
                    event.target.closest('button') || 
                    event.target.closest('.viewpoint-dot') ||
                    event.target.closest('.logo');
            }
            
            if (!isInteractiveElement) {
                toggleUI(); // Toggle UI on double click
                
                // Prevent default browser double-click behavior (text selection, etc.)
                event.preventDefault();
            }
        }
        
        lastClickTime = currentTime;
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    switch(event.key) {
        case 'ArrowLeft': // Left arrow for previous viewpoint
            goToPreviousViewpoint();
            break;
        case 'ArrowRight': // Right arrow for next viewpoint
            goToNextViewpoint();
            break;
        case 'r': // 'R' key for auto-rotate
        case 'R':
            toggleAutoRotate();
            break;
        case 'h': // 'H' key for hide/show UI
        case 'H':
        case 'Escape': // Escape key to show UI if hidden
            if (isUIHidden) {
                toggleUI();
            }
            break;
    }
}

function handleDoubleTap(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    // Double tap (within 300ms)
    if (tapLength < 300 && tapLength > 0) {
        // Check if we tapped on interactive elements
        let isInteractiveElement = false;
        
        if (event.target.closest) {
            isInteractiveElement = 
                event.target.closest('button') || 
                event.target.closest('.viewpoint-dot') ||
                event.target.closest('.logo');
        }
        
        if (!isInteractiveElement) {
            toggleUI(); // Toggle UI on double tap (both hide and show)
            
            // Prevent normal click/tap events from firing
            event.preventDefault();
            event.stopPropagation();
        }
    }
    
    lastTapTime = currentTime;
}

function goToPreviousViewpoint() {
    let newIndex = currentViewpointIndex - 1;
    if (newIndex < 0) {
        newIndex = viewpoints.length - 1;
    }
    changeViewpoint(newIndex);
}

function goToNextViewpoint() {
    let newIndex = currentViewpointIndex + 1;
    if (newIndex >= viewpoints.length) {
        newIndex = 0;
    }
    changeViewpoint(newIndex);
}

function changeViewpoint(index) {
    if (index === currentViewpointIndex) return;
    
    // Update index
    currentViewpointIndex = index;
    
    // Update UI
    updateViewpointInfo();
    
    // Create new video sphere
    createVideoSphere(viewpoints[currentViewpointIndex].videoUrl);
    
    // Preload next video
    preloadNextVideo();
}

function updateViewpointInfo() {
    // Update title
    const titleElement = document.getElementById('viewpoint-title');
    const descriptionElement = document.getElementById('description-text');
    
    if (titleElement) {
        titleElement.textContent = viewpoints[currentViewpointIndex].title;
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = viewpoints[currentViewpointIndex].description;
    }
    
    // Update dots
    const dots = document.querySelectorAll('.viewpoint-dot');
    for (let i = 0; i < dots.length; i++) {
        const dotIndex = parseInt(dots[i].dataset.index);
        if (dotIndex === currentViewpointIndex) {
            dots[i].classList.add('active');
        } else {
            dots[i].classList.remove('active');
        }
    }
}

function toggleAutoRotate() {
    const autoRotateButton = document.getElementById('btn-auto-rotate');
    
    isAutoRotating = !isAutoRotating;
    
    if (controls) {
        controls.autoRotate = isAutoRotating;
    }
    
    if (autoRotateButton) {
        if (isAutoRotating) {
            autoRotateButton.classList.add('active');
        } else {
            autoRotateButton.classList.remove('active');
        }
    }
}

function toggleUI() {
    // Toggle UI visibility state
    isUIHidden = !isUIHidden;
    
    // Apply or remove the UI hidden class to the body
    document.body.classList.toggle('ui-hidden', isUIHidden);
    
    // Show the notification only if:
    // 1. The UI is now hidden (not when showing)
    // 2. We haven't shown the notification before
    if (isUIHidden && !hasShownUIHiddenNotice) {
        const notification = document.getElementById('ui-hidden-notification');
        if (notification) {
            // Show notification
            notification.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(function() {
                notification.style.opacity = '0';
            }, 3000);
            
            // Mark that we've shown the notification
            hasShownUIHiddenNotice = true;
        }
    }
}

function preloadNextVideo() {
    const nextIndex = (currentViewpointIndex + 1) % viewpoints.length;
    const nextUrl = viewpoints[nextIndex].videoUrl;
    
    // Check if already preloaded
    if (!preloadedVideos[nextUrl]) {
        console.log('Preloading next video:', nextUrl);
        
        // Create video element
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        video.src = nextUrl;
        video.muted = true;
        video.loop = true;
        
        // Store when loaded
        video.addEventListener('loadeddata', function() {
            preloadedVideos[nextUrl] = video;
            console.log('Preloaded video:', nextUrl);
        });
        
        // Start loading
        video.load();
    }
}

function hideLoader() {
    const loader = document.getElementById('custom-loader');
    const fadeOverlay = document.getElementById('fade-overlay');
    
    if (loader) loader.style.opacity = '0';
    if (fadeOverlay) fadeOverlay.style.opacity = '0';
    
    // Show UI
    setTimeout(function() {
        const uiOverlay = document.querySelector('.ui-overlay');
        const logoContainer = document.querySelector('.logo-container');
        
        if (uiOverlay) uiOverlay.style.opacity = '1';
        if (logoContainer) logoContainer.style.opacity = '1';
        
        // Remove loader from DOM after fade out
        setTimeout(function() {
            if (loader) loader.style.display = 'none';
            if (fadeOverlay) fadeOverlay.style.display = 'none';
        }, 1000);
    }, 500);
}

function showErrorMessage(message) {
    const loader = document.getElementById('custom-loader');
    if (loader) {
        loader.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">' + 
                           '<h2>Error Loading 360° Experience</h2>' +
                           '<p>' + message + '</p>' +
                           '<button onclick="location.reload()" ' +
                           'style="background: rgba(255,255,255,0.2); border: none; color: white; ' +
                           'padding: 10px 20px; margin-top: 20px; border-radius: 4px; cursor: pointer;">' +
                           'Refresh Page</button>' +
                           '</div>';
        loader.style.opacity = '1';
    }
}