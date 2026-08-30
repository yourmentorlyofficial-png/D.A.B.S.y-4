// js/interaction.js
import { getState, setState } from './state.js';
import { startListening } from './speech.js';

export function setupInteractions() {
    const faceContainer = document.getElementById('face-container') || document.querySelector('.face-container') || document.body;
    
    if (!faceContainer) {
        console.warn("DABSy Warning: Face container not found for interactions.");
        return;
    }

    let holdTimer = null;
    let isHolding = false;

    // Handle touch or click events to initiate interaction (listening state)
    const triggerStart = (e) => {
        // Prevent default behavior to avoid scrolling/zooming weirdness on mobile touch
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        const currentState = getState().status;
        // Don't interrupt if already speaking or thinking heavily, unless desired
        if (currentState === 'speaking' || currentState === 'thinking') {
            return;
        }

        isHolding = true;
        setState({ status: 'listening' });
        
        // Trigger microphone activation workflow
        if (typeof startListening === 'function') {
            startListening();
        } else {
            console.error("startListening function is not available.");
        }
    };

    const triggerEnd = (e) => {
        if (!isHolding) return;
        isHolding = false;
        clearTimeout(holdTimer);
    };

    // Event Listeners for Touch & Mouse interaction
    faceContainer.addEventListener('touchstart', triggerStart, { passive: false });
    faceContainer.addEventListener('touchend', triggerEnd);
    faceContainer.addEventListener('touchcancel', triggerEnd);

    faceContainer.addEventListener('mousedown', triggerStart);
    faceContainer.addEventListener('mouseup', triggerEnd);
    faceContainer.addEventListener('mouseleave', triggerEnd);

    console.log("DABSy Interactions initialized successfully.");
}
