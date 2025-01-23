import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BusCard = ({ busNumber, operatorName, imageUrl, route }) => {
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
        <Card sx={{ maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="240"
                image={`${import.meta.env.BASE_URL}${imageUrl}`}
                alt={`Bus ${busNumber}`}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Bus {busNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {operatorName}
                </Typography>
                <div
                    ref={mapContainerRef}
                    style={{
                        height: 200,
                        width: '100%',
                        marginTop: 16,
                        borderRadius: '4px',
                        zIndex: 0
                    }}
                />
            </CardContent>
        </Card>
    );
};

BusCard.propTypes = {
    busNumber: PropTypes.string.isRequired,
    operatorName: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    route: PropTypes.shape({
        type: PropTypes.string,
        features: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string,
                geometry: PropTypes.object
            })
        )
    }).isRequired,
};

export default BusCard;