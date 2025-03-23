/**
 * Utility functions and device detection
 */

const UTILS = {
    // Device detection
    device: {
        isIOSDevice: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        isIOSChrome: /iPhone|iPad|iPod/i.test(navigator.userAgent) && /CriOS/i.test(navigator.userAgent),
        isIOSSafari: /iPhone|iPad|iPod/i.test(navigator.userAgent) && /Version\//.test(navigator.userAgent) && !/CriOS/i.test(navigator.userAgent),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        
        get isAnyiOS() {
            return this.isIOSDevice;
        }
    },
    
    // DOM helpers
    dom: {
        /**
         * Get element by ID with error handling
         */
        getElement(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found`);
            }
            return element;
        },
        
        /**
         * Get elements by selector with error handling
         */
        getElements(selector) {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                console.warn(`No elements found with selector '${selector}'`);
            }
            return elements;
        }
    },
    
    // Resource management
    resources: {
        /**
         * Safely dispose Three.js resources
         */
        disposeThreeJSObject(obj) {
            if (!obj) return;
            
            // Dispose geometry
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            
            // Dispose material(s)
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    });
                } else {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            }
            
            // Handle children recursively
            if (obj.children && obj.children.length > 0) {
                for (let i = obj.children.length - 1; i >= 0; i--) {
                    this.disposeThreeJSObject(obj.children[i]);
                }
            }
        },
        
        /**
         * Clean up video element
         */
        cleanupVideo(videoElement) {
            if (!videoElement) return;
            
            try {
                videoElement.pause();
                videoElement.removeAttribute('src');
                videoElement.load();
                if (videoElement.parentNode) {
                    videoElement.parentNode.removeChild(videoElement);
                }
            } catch (error) {
                console.error('Error cleaning up video element:', error);
            }
        }
    },
    
    // Error handling
    errors: {
        /**
         * Show error message to user
         */
        showUserError(message) {
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
                loader.style.display = 'flex';
            } else {
                console.error('Error:', message);
                alert(`Error: ${message}\n\nPlease refresh the page.`);
            }
        },
        
        /**
         * Log error with additional context
         */
        logError(error, context = '') {
            console.error(`[Van't Hof 360°]${context ? ' ' + context : ''}:`, error);
        }
    }
};