/**
 * Configuration and data for the 360° experience
 */

// Viewpoint configuration
const CONFIG = {
    // Animation and transition timing
    transitions: {
        fadeInDuration: 500,  // ms
        fadeOutDuration: 500, // ms
        loaderHideDuration: 500 // ms
    },
    
    // UI options
    ui: {
        autoHideTimeout: 3000, // ms
        doubleTapTimeout: 300  // ms for detecting double tap/click
    },
    
    // Camera settings
    camera: {
        initialPosition: { x: 100, y: 20, z: 0 },
        fov: 75,
        near: 1,
        far: 1000,
        minDistance: 5,
        maxDistance: 300,
        rotateSpeed: 0.5,
        autoRotateSpeed: 0.5
    }
};

// Viewpoint data
const VIEWPOINTS = [
    {
        id: 0,
        title: "Processing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth2_edit.mp4",
        description: "Advanced processing transforms raw ingredients into premium food products using state-of-the-art machinery."
    },
    {
        id: 1,
        title: "Frying",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth3_edit.mp4",
        description: "Through the frying process with our frying line, we ensure that any bacteria present are killed."
    },
    {
        id: 2,
        title: "Freezing",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth4_edit.mp4",
        description: "Immediately after frying, the spring rolls are cooled down in a spiral freezer. Unfortunately, it is too cold to make a video in the freezer."
    },
    {
        id: 3,
        title: "Packaging",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth5_edit.mp4",
        description: "Our springrolls are packaged with two rolls per retail unit. These are then organized into carton delivery boxes or crates."
    },
    {
        id: 4,
        title: "Labeling",
        videoUrl: "https://assets.360.petsq.works/vanthof/vth6_edit.mp4",
        description: "We provide white-label solutions, delivering products that are retail-ready while maintaining food safety standards throughout the entire process."
    }
];