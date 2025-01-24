import { useStarExplosion } from '../hooks/useStarExplosion';

export const AnimatedHeader = ({ children, className = '', ...props }) => {
    const createStarExplosion = useStarExplosion();
    const letters = children.split('');

    return (
        <h1
            className="fun-header text-center py-4 cursor-pointer text-5xl"
            onClick={createStarExplosion}
            {...props}
        >
            {letters.map((letter, index) => (
                <span key={index} className="letter-wrapper inline-block" style={{
                    animation: 'wave-bounce 1s infinite',
                    animationDelay: `${index * 0.1}s`
                }}>
                    <span className="letter-outline">{letter === ' ' ? '\u00A0' : letter}</span>
                    <span className="letter-fill rainbow-text">{letter === ' ' ? '\u00A0' : letter}</span>
                </span>
            ))}
        </h1>
    );
};