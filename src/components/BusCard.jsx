import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geometryutil';

const BusCard = ({ busNumber, operatorName, images, route, datasetId, serviceName, serviceCode, rupert_ridden }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const markerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            try {
                if (route && route.features && route.features[0]?.geometry) {
                    mapRef.current = L.map(mapContainerRef.current);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapRef.current);

                    // Create a GeoJSON layer
                    const routeLayer = L.geoJSON(route, {
                        style: {
                            color: 'blue',
                            weight: 3,
                            opacity: 0.7
                        }
                    }).addTo(mapRef.current);

                    // Create bus emoji marker
                    const busIcon = L.divIcon({
                        html: '🚌',
                        className: 'bus-emoji-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });

                    markerRef.current = L.marker([0, 0], { icon: busIcon }).addTo(mapRef.current);

                    // Animation function
                    let distance = 0;
                    const animate = () => {
                        const line = routeLayer.getLayers()[0];
                        const length = L.GeometryUtil.length(line);

                        // Increase from 0.5 to 2.5 for 5x speed
                        distance = (distance + 2.5) % length;
                        const point = L.GeometryUtil.interpolateOnLine(
                            mapRef.current,
                            line,
                            distance / length
                        );

                        if (point && markerRef.current) {
                            markerRef.current.setLatLng(point.latLng);

                            // Rotate marker in direction of travel
                            if (point.predecessor && point.successor) {
                                const angle = L.GeometryUtil.computeAngle(
                                    mapRef.current,
                                    point.predecessor,
                                    point.successor
                                );
                                markerRef.current.getElement().style.transform += ` rotate(${angle}deg)`;
                            }
                        }

                        animationRef.current = requestAnimationFrame(animate);
                    };

                    // Start animation
                    animate();

                    // Fit the map to the bounds of the GeoJSON
                    const layer = L.geoJSON(route);
                    const bounds = layer.getBounds();
                    mapRef.current.fitBounds(bounds);

                    setTimeout(() => {
                        if (mapRef.current) {
                            mapRef.current.invalidateSize();
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error handling route:', error);
                // Fallback to London center if error
                mapRef.current = L.map(mapContainerRef.current).setView([51.5074, -0.1278], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (markerRef.current) {
                markerRef.current.remove();
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [route]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div
            className={`max-w-[345px] m-2 ${rupert_ridden ? 'bg-amber-50 border-2 border-amber-400' : 'bg-white'
                } rounded-lg shadow-md overflow-hidden`}
        >
            {images && images.length > 0 && (
                <div className="relative">
                    <img
                        src={`${import.meta.env.BASE_URL}${images[currentImageIndex]}`}
                        alt={`Bus ${busNumber} (Dataset ${datasetId})`}
                        className="w-full h-[240px] object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={previousImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            >
                                ←
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            >
                                →
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
            <div className="p-4">
                <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                    Bus {busNumber}
                    {rupert_ridden && (
                        <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Ridden
                        </span>
                    )}
                </h2>
                <p className="text-gray-600 text-sm">
                    {operatorName} (Dataset {datasetId})
                </p>
                <p className="text-gray-600 text-sm">
                    {serviceName} ({serviceCode})
                </p>
                <div
                    ref={mapContainerRef}
                    className="h-[200px] w-full mt-4 rounded relative"
                    style={{ zIndex: 0 }}
                />
            </div>
        </div>
    );
};

BusCard.propTypes = {
    busNumber: PropTypes.string.isRequired,
    operatorName: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    route: PropTypes.shape({
        type: PropTypes.string,
        features: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string,
                geometry: PropTypes.object
            })
        )
    }).isRequired,
    datasetId: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    serviceCode: PropTypes.string.isRequired,
    rupert_ridden: PropTypes.bool
};

export default BusCard;