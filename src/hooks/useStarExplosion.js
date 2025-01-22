import { useCallback } from 'react';

export const useStarExplosion = () => {
    const createStarExplosion = useCallback((event) => {
        const element = event.target;
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            const size = Math.random() * 15 + 10;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            const hue = Math.random() * 60 + 40;
            star.style.background = `hsl(${hue}, 100%, 50%)`;

            star.style.setProperty('--tx', `${tx}px`);
            star.style.setProperty('--ty', `${ty}px`);

            star.style.left = `${centerX}px`;
            star.style.top = `${centerY}px`;

            document.body.appendChild(star);

            setTimeout(() => star.remove(), 750 + Math.random() * 250);
        }
    }, []);

    return createStarExplosion;
};