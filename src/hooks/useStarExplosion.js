import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useStarExplosion = () => {
    const createConfettiExplosion = useCallback((event) => {
        const clickX = event.clientX;
        const clickY = event.clientY;

        // Convert click coordinates into normalized values (0 to 1)
        const originX = clickX / window.innerWidth;
        const originY = clickY / window.innerHeight;

        const scalar = 7;
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





        // ------------------------------------------------------------------------
        // Added star explosion after the buses using the provided colours!
        const starDefaults = {
            origin: { x: originX, y: originY },
            spread: 360,
            ticks: 50,
            gravity: 2,
            decay: 0.99,
            startVelocity: 30,
            colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
        };

        const shootStars = () => {
            confetti({
                ...starDefaults,
                particleCount: 400,
                scalar: 1.2,
                shapes: ['star']
            });

        };

        setTimeout(shootStars, 300);

        // ------------------------------------------------------------------------
    }, []);

    return createConfettiExplosion;
};