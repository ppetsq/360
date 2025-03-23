# Van 't Hof 360° Experience

An interactive 360° tour of the Van 't Hof production line.

## About

This application provides an immersive 360° video tour of the Van 't Hof production facility, allowing visitors to explore different stages of food production from processing to packaging.

## Features

- 360° video experience that works on both mobile and desktop
- Five production stages to explore
- Auto-rotation option
- Double-tap/click to hide UI for distraction-free viewing

## Technical Architecture

### Project Structure
```
├── index.html           # Main HTML file
├── styles.css           # CSS styles
├── js/                  # JavaScript modules
│   ├── config.js        # Configuration and viewpoint data
│   ├── utils.js         # Utility functions and device detection
│   ├── sceneManager.js  # Three.js scene management
│   ├── videoManager.js  # Video loading and playback
│   ├── uiController.js  # UI interactions
│   └── main.js          # Application initialization
```

### Key Components

- **SceneManager**: Handles Three.js scene, camera, and renderer setup
- **VideoManager**: Handles video loading, caching, and playback
- **UIController**: Manages UI interactions and viewpoint transitions
- **Utils**: Provides helper functions for DOM manipulation, device detection, and error handling

### Performance Optimizations

- Video preloading for smoother transitions
- Resource management to prevent memory leaks
- Device-specific optimizations for iOS/Android
- Transition timing optimization for seamless viewpoint changes

## Setup & Deployment

1. Ensure all files are in the correct structure
2. Host on any web server that supports static files
3. Videos are referenced via URLs in `config.js`

## Browser Compatibility

- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome for Android

## Dependencies

- Three.js r128
- Three.js OrbitControls

## Contact

Developed by [petsq.works](https://petsq.works)  
Email: hello@petsq.works