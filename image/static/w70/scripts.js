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
    indicator.style.transform = `translateX(${activeTab.offsetLeft - 6}px)`;
    
    // Show/hide viewpoint navigation
    document.getElementById('club-viewpoints').style.display = currentLocation === 'club' ? 'flex' : 'none';
    document.getElementById('etage-viewpoints').style.display = currentLocation === 'etage' ? 'flex' : 'none';
    
    // Update viewpoint buttons
    document.querySelectorAll('.viewpoint-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Set active viewpoint button
    document.getElementById(`${currentLocation}-${currentViewpoint}`).classList.add('active');
    
    // Update rotate button state
    const rotateButton = document.getElementById('rotate-button');
    rotateButton.classList.toggle('active', isPanning);
}

// Handle main navigation button clicks
function handleNavigationClick(location) {
    if (currentLocation === location) return;
    
    currentLocation = location;
    currentViewpoint = 1;
    updateNavigation();
    loadViewpoint(currentLocation, currentViewpoint);
}

// Switch between viewpoints
function switchViewpoint(location, viewpointId) {
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
    updateNavigation();
}

// Load a specific viewpoint
function loadViewpoint(location, viewpointId) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    viewer.stopAutorotate();
    isPanning = false;
    updateNavigation();
    
    document.querySelector(".viewer-container").style.opacity = "0";
    
    setTimeout(() => {
        const viewpointData = viewpoints[location][viewpointId - 1];
        
        viewer.setPanorama(viewpointData.panorama, {
            showLoader: false,
            transition: false
        }).then(() => {
            viewer.zoom(50);
            viewer.rotate(viewpointData.initialPosition);
            
            document.querySelector(".viewer-container").style.opacity = "1";
            
            setTimeout(() => {
                viewer.startAutorotate();
                isPanning = true;
                updateNavigation();
                isTransitioning = false;
            }, 1000);
        });
    }, 800);
}

// Handle click events on the viewer
function togglePanning(e) {
    if (isTransitioning) return;
    
    if (e && e.target.closest('.main-container')) {
        return;
    }
    
    toggleAutoRotate();
}

// Initialize the viewer
document.addEventListener("DOMContentLoaded", () => {
    initializeViewer();
    updateNavigation();
    
    document.addEventListener('keydown', handleKeydown);
    
});

// Initialize PhotoSphereViewer
function initializeViewer() {
    const viewerContainer = document.querySelector('#viewer');
    if (!viewerContainer) {
        console.error("Viewer container not found!");
        return;
    }
    
    const initialViewpoint = viewpoints[currentLocation][currentViewpoint - 1];
    
    viewer = new PhotoSphereViewer.Viewer({
        container: viewerContainer,
        panorama: initialViewpoint.panorama,
        navbar: false,
        touchmoveTwoFingers: false,
        loadingTxt: '',
        loadingImg: null,
        defaultZoomLvl: 50,
        minFov: 50,
        maxFov: 100,
        autorotateSpeed: "0.5rpm",
        autorotateDelay: 1000
    });

    viewer.once('ready', () => {
        viewer.zoom(50);
        viewer.rotate(initialViewpoint.initialPosition);
        
        setTimeout(() => {
            viewer.startAutorotate();
            isPanning = true;
            updateNavigation();
            
            viewerContainer.style.opacity = "1";
            setTimeout(() => {
                document.getElementById('loading-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-overlay').style.display = 'none';
                }, 800);
            }, 500);
        }, 300);
    });
    
    viewerContainer.addEventListener("click", togglePanning);
    viewerContainer.addEventListener("touchend", togglePanning);
}