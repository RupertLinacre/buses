import { useState } from 'react';
import { useStarExplosion } from '../hooks/useStarExplosion';

export const AnimatedHeader = ({ children, className = '', ...props }) => {
    const createStarExplosion = useStarExplosion();
    const [isBouncing, setIsBouncing] = useState(false);
    const letters = children.split('');

    const handleClick = (e) => {
        createStarExplosion(e);
        setIsBouncing(true);
        // Calculate the base time required:
        // maximum delay per letter = (letters.length - 1) * 0.1s, plus bounce duration of 1s.
        const baseTime = ((letters.length - 1) * 0.1 + 1) * 1000;
        // The rainbow animation cycle is 2000ms.
        // Round up the total time so that it ends at a cycle boundary.
        const cycleTime = 2000;
        const totalTimeAdjusted = Math.ceil(baseTime / cycleTime) * cycleTime;
        setTimeout(() => setIsBouncing(false), totalTimeAdjusted);
    };

    return (
        <h1
            className={`fun-header text-center py-4 cursor-pointer text-5xl ${className}`}
            onClick={handleClick}
            {...props}
        >
            {letters.map((letter, index) => (
                <span
                    key={index}
                    className={`letter-wrapper inline-block${isBouncing ? ' bounce-animation' : ''}`}
                    style={{
                        animation: isBouncing ? undefined : 'none',
                        animationDelay: isBouncing ? `${index * 0.1}s` : undefined
                    }}
                >
                    <span className="letter-outline will-change-transform">
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                    <span
                        className="letter-fill rainbow-text rainbow-animation will-change-transform"
                        style={{ animationPlayState: isBouncing ? 'running' : 'paused' }}
                    >
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                </span>
            ))}
        </h1>
    );
};