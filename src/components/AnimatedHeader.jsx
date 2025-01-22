import { useStarExplosion } from '../hooks/useStarExplosion';

export const AnimatedHeader = ({ children, className = '', ...props }) => {
    const createStarExplosion = useStarExplosion();

    return (
        <h1
            className={`fun-header ${className}`.trim()}
            onClick={createStarExplosion}
            {...props}
        >
            {children}
        </h1>
    );
};