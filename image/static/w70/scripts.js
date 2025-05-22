      // Configuration for viewpoints
      const viewpoints = {
        club: [
            {
                id: 1,
                panorama: "https://assets.360.petsq.works/w70/club_1.jpg",
                name: "Club 1",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 2,
                panorama: "https://assets.360.petsq.works/w70/club_2.jpg",
                name: "Club 2",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 3,
                panorama: "https://assets.360.petsq.works/w70/club_3.jpg",
                name: "Club 3",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 4,
                panorama: "https://assets.360.petsq.works/w70/club_4.jpg",
                name: "Club 4",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 5,
                panorama: "https://assets.360.petsq.works/w70/club_5.jpg",
                name: "Club 5",
                initialPosition: { longitude: 0, latitude: 0 }
            }
        ],
        etage: [
            {
                id: 1,
                panorama: "https://assets.360.petsq.works/w70/etage_1.jpg",
                name: "Etage 1",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 2,
                panorama: "https://assets.360.petsq.works/w70/etage_2.jpg",
                name: "Etage 2",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 3,
                panorama: "https://assets.360.petsq.works/w70/etage_3.jpg",
                name: "Etage 3",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 4,
                panorama: "https://assets.360.petsq.works/w70/etage_4.jpg",
                name: "Etage 4",
                initialPosition: { longitude: 0, latitude: 0 }
            },
            {
                id: 5,
                panorama: "https://assets.360.petsq.works/w70/etage_5.jpg",
                name: "Etage 5",
                initialPosition: { longitude: 0, latitude: 0 }
            }
        ]
    };

    let viewer;
    let currentLocation = "club";
    let currentViewpoint = 1;
    let isPanning = false;
    let isTransitioning = false;
    let keyboardInfoTimeout = null;
    
    // Update navigation UI
    function updateNavigation() {
        // Update tab buttons and indicator
        const clubButton = document.getElementById('club-button');
        const etageButton = document.getElementById('etage16-button');
        
        clubButton.classList.toggle('active', currentLocation === 'club');
        etageButton.classList.toggle('active', currentLocation === 'etage');
        
        // Move the tab indicator
        const indicator = document.querySelector('.tab-indicator');
        const activeTab = currentLocation === 'club' ? clubButton : etageButton;
        
        indicator.style.width = activeTab.offsetWidth + 'px';
        indicator.style.transform = `translateX(${activeTab.offsetLeft - 8}px)`;
        
        // Show/hide viewpoint navigation
        document.getElementById('club-viewpoints').style.display = currentLocation === 'club' ? 'flex' : 'none';
        document.getElementById('etage-viewpoints').style.display = currentLocation === 'etage' ? 'flex' : 'none';
        
        // Update viewpoint buttons
        document.querySelectorAll('.viewpoint-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Set active viewpoint button
        document.getElementById(`${currentLocation}-${currentViewpoint}`).classList.add('active');
    }
    
    // Handle main navigation button clicks
    function handleNavigationClick(location) {
        // Stop event propagation to prevent togglePanning from being called
        event && event.stopPropagation();
        
        if (currentLocation === location) return;
        
        currentLocation = location;
        currentViewpoint = 1; // Reset to first viewpoint when changing location
        updateNavigation();
        loadViewpoint(currentLocation, currentViewpoint);
    }
    
    // Switch between viewpoints
    function switchViewpoint(location, viewpointId) {
        // Stop event propagation
        event && event.stopPropagation();
        
        if (isTransitioning || (currentLocation === location && currentViewpoint === viewpointId)) return;
        
        currentViewpoint = viewpointId;
        updateNavigation();
        loadViewpoint(currentLocation, currentViewpoint);
    }
    
    // Navigate to the next viewpoint
    function nextViewpoint() {
        if (isTransitioning) return;
        
        const maxViewpoints = viewpoints[currentLocation].length;
        const nextId = currentViewpoint >= maxViewpoints ? 1 : currentViewpoint + 1;
        
        switchViewpoint(currentLocation, nextId);
    }
    
    // Navigate to the previous viewpoint
    function prevViewpoint() {
        if (isTransitioning) return;
        
        const maxViewpoints = viewpoints[currentLocation].length;
        const prevId = currentViewpoint <= 1 ? maxViewpoints : currentViewpoint - 1;
        
        switchViewpoint(currentLocation, prevId);
    }
    
    // Toggle auto-rotation
    function toggleAutoRotate() {
        if (isTransitioning) return;
        
        if (isPanning) {
            viewer.stopAutorotate();
            isPanning = false;
        } else {
            viewer.startAutorotate();
            isPanning = true;
        }
    }
    
    // Show keyboard info popup
    function showKeyboardInfo() {
        const keyboardInfo = document.getElementById('keyboard-info');
        keyboardInfo.classList.add('visible');
        
        if (keyboardInfoTimeout) {
            clearTimeout(keyboardInfoTimeout);
        }
        
        keyboardInfoTimeout = setTimeout(() => {
            keyboardInfo.classList.remove('visible');
        }, 4000); // Hide after 4 seconds
    }
    
    // Handle keyboard controls
    function handleKeydown(e) {
        // Only handle key events if viewer is ready
        if (!viewer || isTransitioning) return;
        
        showKeyboardInfo();
        
        switch (e.key) {
            case ' ': // Space bar
                toggleAutoRotate();
                break;
            case 'ArrowLeft': // Left arrow
                prevViewpoint();
                break;
            case 'ArrowRight': // Right arrow
                nextViewpoint();
                break;
            case 'ArrowUp': // Up arrow
                if (currentLocation !== 'club') {
                    handleNavigationClick('club');
                }
                break;
            case 'ArrowDown': // Down arrow
                if (currentLocation !== 'etage') {
                    handleNavigationClick('etage');
                }
                break;
        }
    }
    
    // Load a specific viewpoint
    function loadViewpoint(location, viewpointId) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Always stop rotation immediately for consistent behavior
        viewer.stopAutorotate();
        isPanning = false;
        
        // Fade out the viewer
        document.querySelector(".viewer-container").style.opacity = "0";
        
        // Wait for fade-out to complete
        setTimeout(() => {
            // Get the viewpoint data
            const viewpointData = viewpoints[location][viewpointId - 1];
            
            // Change panorama with no transition effect
            viewer.setPanorama(viewpointData.panorama, {
                showLoader: false,
                transition: false
            }).then(() => {
                // Reset position and zoom
                viewer.zoom(50); // Adjusted for better perspective
                viewer.rotate(viewpointData.initialPosition);
                
                // Fade in the viewer
                document.querySelector(".viewer-container").style.opacity = "1";
                
                // After fully visible, start rotation again
                setTimeout(() => {
                    viewer.startAutorotate();
                    isPanning = true;
                    isTransitioning = false;
                }, 1000);
            });
        }, 800);
    }
    
    // Handle click events on the viewer
    function togglePanning(e) {
        // Don't toggle if we're in transition
        if (isTransitioning) return;
        
        // Only respond to direct clicks on the viewer, not UI elements
        if (e && (e.target.closest('.ui-header') || e.target.closest('.ui-footer'))) {
            return;
        }
        
        toggleAutoRotate();
    }
    
    // Initialize the viewer
    document.addEventListener("DOMContentLoaded", () => {
        initializeViewer();
        updateNavigation();
        
        // Initialize keyboard controls
        document.addEventListener('keydown', handleKeydown);
        
        // Show keyboard info on first load
        setTimeout(showKeyboardInfo, 2000);
    });

    // Initialize PhotoSphereViewer
    function initializeViewer() {
        const viewerContainer = document.querySelector('#viewer');
        if (!viewerContainer) {
            console.error("Viewer container not found!");
            return;
        }
        
        // Get initial viewpoint data
        const initialViewpoint = viewpoints[currentLocation][currentViewpoint - 1];
        
        viewer = new PhotoSphereViewer.Viewer({
            container: viewerContainer,
            panorama: initialViewpoint.panorama,
            navbar: false,
            touchmoveTwoFingers: false,
            loadingTxt: '',
            loadingImg: null,
            defaultZoomLvl: 50,
            minFov: 50,  // Limit minimum FOV to prevent extreme zoom
            maxFov: 100,  // Limit maximum FOV to prevent distortion
            autorotateSpeed: "0.5rpm", // Rotation speed in rpm units
            autorotateDelay: 1000      // Start autorotation after 1 second
        });

        viewer.once('ready', () => {
            viewer.zoom(50); // Better starting zoom level
            viewer.rotate(initialViewpoint.initialPosition);
            
            // Start rotation after a short delay
            setTimeout(() => {
                viewer.startAutorotate();
                isPanning = true;
                
                viewerContainer.style.opacity = "1";
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('loading-overlay').style.display = 'none';
                    }, 800);
                }, 500);
            }, 300);
        });
        
        // Handle click/touch to pause/play auto-panning
        viewerContainer.addEventListener("click", togglePanning);
        viewerContainer.addEventListener("touchend", togglePanning);
    }