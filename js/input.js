// Input-hantering: tangentbord och touch

const keys = {};
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const touchButtons = {
    left:  { x: 20,  y: 480, w: 80, h: 80, key: 'ArrowLeft',  label: '←', pressed: false },
    right: { x: 120, y: 480, w: 80, h: 80, key: 'ArrowRight', label: '→', pressed: false },
    jump:  { x: 680, y: 480, w: 100, h: 100, key: 'ArrowUp',  label: '↑', pressed: false },
};

function touchToCanvas(touch, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function hitButton(pos, btn) {
    return pos.x >= btn.x && pos.x <= btn.x + btn.w &&
           pos.y >= btn.y && pos.y <= btn.y + btn.h;
}

function updateTouchButtons(touches, canvas) {
    for (const name in touchButtons) {
        touchButtons[name].pressed = false;
        keys[touchButtons[name].key] = false;
    }
    for (let i = 0; i < touches.length; i++) {
        const pos = touchToCanvas(touches[i], canvas);
        for (const name in touchButtons) {
            const btn = touchButtons[name];
            if (hitButton(pos, btn)) {
                btn.pressed = true;
                keys[btn.key] = true;
            }
        }
    }
}

// Koppla ihop input-events med canvas
// getGameState/getStateTimer är funktioner så vi alltid läser aktuellt värde
function setupInput(canvas, getGameState, getStateTimer, restartFn) {
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        updateTouchButtons(e.touches, canvas);
        if (getGameState() === 'dead' && getStateTimer() > 90) restartFn();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        updateTouchButtons(e.touches, canvas);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        updateTouchButtons(e.touches, canvas);
    }, { passive: false });

    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        updateTouchButtons(e.touches, canvas);
    }, { passive: false });
}
