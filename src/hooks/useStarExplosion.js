import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useStarExplosion = () => {
    const createConfettiExplosion = useCallback((event) => {
        const clickX = event.clientX;
        const clickY = event.clientY;

        // Convert click coordinates into normalized values (0 to 1)
        const originX = clickX / window.innerWidth;
        const originY = clickY / window.innerHeight;

        const scalar = 5;
        const bus = confetti.shapeFromText({ text: '🚌', scalar });

        const defaults = {
            origin: { x: originX, y: originY },
            spread: 360,
            ticks: 60,
            gravity: 1,
            decay: 0.96,
            startVelocity: 20,
            shapes: [bus],
            scalar,
        };

        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 30
            });
        }, 0);

        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 5,
                flat: true
            });
        }, 100);

        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: 300,
                scalar: scalar / 4,

            });
        }, 200);
    }, []);

    return createConfettiExplosion;
};