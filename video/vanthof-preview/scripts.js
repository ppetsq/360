/**
 * Van 't Hof Production Line 360° Experience
 * Alternative implementation using Three.js directly for 360° video
 */

// Define the viewpoints with their metadata
const viewpoints = [
    {
        id: 0,
        title: "Preparation",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth1.mp4"
    },
    {
        id: 1,
        title: "Processing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth2.mp4"
    },
    {
        id: 2,
        title: "Quality Control",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth3.mp4"
    },
    {
        id: 3,
        title: "Packaging",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth4.mp4"
    },
    {
        id: 4,
        title: "Storage",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth5.mp4"
    },
    {
        id: 5,
        title: "Shipping",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth6.mp4"
    }
];

// Global variables
let currentViewpointIndex = 0;
let isPlaying = true;
let isAutoRotating = false;
let isMuted = false;
let isUIHidden = false;
let lastTapTime = 0;

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
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 0.1); // Slight offset to avoid rendering issues
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    const container = document.getElementById('video-container');
    if (container) {
        container.appendChild(renderer.domElement);
    }
    
    // Add OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function createVideoSphere(videoUrl) {
    // Create video element if not preloaded
    if (preloadedVideos[videoUrl]) {
        videoElement = preloadedVideos[videoUrl];
        setupVideoSphere();
    } else {
        videoElement = document.createElement('video');
        videoElement.crossOrigin = 'anonymous';
        videoElement.loop = true;
        videoElement.muted = isMuted;
        videoElement.playsInline = true;
        videoElement.src = videoUrl;
        
        // Wait for video to be loaded
        videoElement.addEventListener('loadeddata', function() {
            // Cache the video
            preloadedVideos[videoUrl] = videoElement;
            
            // Set up video sphere
            setupVideoSphere();
            
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
    
    // Auto-play when ready
    if (isPlaying && videoElement.readyState >= 2) {
        videoElement.play()
            .catch(function(e) {
                console.warn('Autoplay prevented:', e);
                // Add play button or interface for user interaction
            });
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
    
    // Play video if needed
    if (isPlaying) {
        videoElement.play()
            .catch(function(e) {
                console.warn('Autoplay prevented:', e);
            });
    }
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
    
    // Control buttons
    const playPauseButton = document.getElementById('btn-play-pause');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', togglePlayPause);
    }
    
    const muteButton = document.getElementById('btn-mute');
    if (muteButton) {
        muteButton.addEventListener('click', toggleMute);
    }
    
    const autoRotateButton = document.getElementById('btn-auto-rotate');
    if (autoRotateButton) {
        autoRotateButton.addEventListener('click', toggleAutoRotate);
    }
    
    const hideUIButton = document.getElementById('btn-hide-ui');
    if (hideUIButton) {
        hideUIButton.addEventListener('click', toggleUI);
    }
    
    // Double tap for mobile
    document.addEventListener('touchstart', handleDoubleTap);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    switch(event.key) {
        case ' ': // Space bar for play/pause
            togglePlayPause();
            break;
        case 'ArrowLeft': // Left arrow for previous viewpoint
            goToPreviousViewpoint();
            break;
        case 'ArrowRight': // Right arrow for next viewpoint
            goToNextViewpoint();
            break;
        case 'm': // 'M' key for mute/unmute
        case 'M':
            toggleMute();
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
    if (titleElement) {
        titleElement.textContent = viewpoints[currentViewpointIndex].title;
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

function togglePlayPause() {
    const playPauseButton = document.getElementById('btn-play-pause');
    
    if (!videoElement) return;
    
    if (isPlaying) {
        // Pause
        videoElement.pause();
        isPlaying = false;
        
        if (playPauseButton) {
            playPauseButton.classList.remove('playing');
            playPauseButton.classList.add('paused');
            
            const svg = playPauseButton.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
            }
        }
    } else {
        // Play
        videoElement.play()
            .catch(function(e) {
                console.warn('Play prevented:', e);
            });
        isPlaying = true;
        
        if (playPauseButton) {
            playPauseButton.classList.remove('paused');
            playPauseButton.classList.add('playing');
            
            const svg = playPauseButton.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
            }
        }
    }
}

function toggleMute() {
    const muteButton = document.getElementById('btn-mute');
    
    if (!videoElement) return;
    
    isMuted = !isMuted;
    videoElement.muted = isMuted;
    
    if (muteButton) {
        const svg = muteButton.querySelector('svg');
        if (svg) {
            if (isMuted) {
                svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
                muteButton.classList.add('active');
            } else {
                svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
                muteButton.classList.remove('active');
            }
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
    isUIHidden = !isUIHidden;
    
    document.body.classList.toggle('ui-hidden', isUIHidden);
    
    if (isUIHidden) {
        // Show notification
        const notification = document.getElementById('ui-hidden-notification');
        if (notification) {
            notification.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(function() {
                notification.style.opacity = '0';
            }, 3000);
        }
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
            if (isUIHidden) {
                toggleUI(); // Show UI on double tap when hidden
            }
        }
    }
    
    lastTapTime = currentTime;
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