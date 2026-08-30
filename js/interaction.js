// js/interaction.js
import { state, setState } from './state.js';
import { startListening } from './speech.js';

export function setupInteraction() {
    // Target the main character wrapper or world where touches happen
    const touchTarget = document.getElementById('character') || document.getElementById('dabsyWorld') || document.body;
    
    if (!touchTarget) {
        console.warn("DABSy Warning: Touch target container not found.");
        return;
    }

    let isHolding = false;

    const handleTouchStart = (e) => {
        // Prevent default mobile scrolling/zooming behavior on touch
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        // Do not interrupt if DABSy is busy thinking or speaking loudly
        if (state.speaking || state.thinking) {
            return;
        }

        isHolding = true;

        // If already listening, toggle off or restart, else start listening
        if (typeof startListening === 'function') {
            startListening();
        } else {
            console.error("startListening function is not available.");
        }
    };

    const handleTouchEnd = (e) => {
        if (!isHolding) return;
        isHolding = false;
    };

    // Attach both touch and mouse click events so it works on desktop and mobile
    touchTarget.addEventListener('touchstart', handleTouchStart, { passive: false });
    touchTarget.addEventListener('touchend', handleTouchEnd);
    touchTarget.addEventListener('touchcancel', handleTouchEnd);

    touchTarget.addEventListener('mousedown', handleTouchStart);
    touchTarget.addEventListener('mouseup', handleTouchEnd);
    touchTarget.addEventListener('mouseleave', handleTouchEnd);

    console.log("DABSy Interaction system initialized successfully.");
}
