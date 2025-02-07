import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BusCard = ({ busNumber, operatorName, imageUrl, route, datasetId, serviceName, serviceCode }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            try {
                if (route && route.features && route.features[0]?.geometry) {
                    mapRef.current = L.map(mapContainerRef.current);

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(mapRef.current);



                    // Create a GeoJSON layer
                    L.geoJSON(route, {
                        style: {
                            color: 'blue',
                            weight: 3,
                            opacity: 0.7
                        }
                    }).addTo(mapRef.current);

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
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [route]);

    return (
        <div className="max-w-[345px] m-2 bg-white rounded-lg shadow-md overflow-hidden">
            {imageUrl && (
                <img
                    src={`${import.meta.env.BASE_URL}${imageUrl}`}
                    alt={`Bus ${busNumber} (Dataset ${datasetId})`}
                    className="w-full h-[240px] object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            )}
            <div className="p-4">
                <h2 className="text-xl font-medium mb-2">
                    Bus {busNumber}
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
    imageUrl: PropTypes.string,
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
    serviceCode: PropTypes.string.isRequired
};

export default BusCard;