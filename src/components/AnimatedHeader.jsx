import { useStarExplosion } from '../hooks/useStarExplosion';

export const AnimatedHeader = ({ children, className = '', ...props }) => {
    const createStarExplosion = useStarExplosion();

    return (
        <h1
            className={`fun-header text-4xl md:text-5xl font-extrabold text-center
                py-4 text-blue-600 hover:text-blue-700 transition-colors
                cursor-pointer select-none tracking-wide
                drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]
                ${className}`.trim()}
            onClick={createStarExplosion}
            {...props}
        >
            {children}
        </h1>
    );
};