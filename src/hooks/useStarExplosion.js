import { useCallback } from 'react';

export const useStarExplosion = () => {
    const createStarExplosion = useCallback((event) => {
        const clickX = event.clientX;
        const clickY = event.clientY;

        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.random() * 600 + 200;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            const size = Math.random() * 30 + 5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            const hue = Math.random() * 360;
            const saturation = Math.random() * 15 + 85;
            const lightness = Math.random() * 45 + 35;
            star.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

            star.style.setProperty('--tx', `${tx}px`);
            star.style.setProperty('--ty', `${ty}px`);

            star.style.left = `${clickX}px`;
            star.style.top = `${clickY}px`;

            document.body.appendChild(star);

            setTimeout(() => star.remove(), 950 + Math.random() * 450);
        }
    }, []);

    return createStarExplosion;
};