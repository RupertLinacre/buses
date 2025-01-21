import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BusCard = ({ busNumber, operatorName, imageUrl, route }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    const parseMultiLineString = (multiLineString) => {
        try {
            if (!multiLineString) return [];

            const coordsString = multiLineString
                .replace('MULTILINESTRING ((', '')
                .replace('))', '');

            // Split into multiple line strings and process each one
            return coordsString.split('),  (').map(lineString => {
                return lineString.split(',').map(coord => {
                    const [lng, lat] = coord.trim().split(' ');
                    return [parseFloat(lat), parseFloat(lng)];
                }).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
            });
        } catch (error) {
            console.error('Error parsing route:', error);
            return [];
        }
    };

    useEffect(() => {
        // Initialize map if it hasn't been initialized yet
        if (!mapRef.current && mapContainerRef.current) {
            const routeSegments = parseMultiLineString(route);

            if (routeSegments.length > 0) {
                // Get the first coordinate of the first segment for initial view
                mapRef.current = L.map(mapContainerRef.current).setView(routeSegments[0][0], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapRef.current);

                // Add each route segment as a separate polyline
                routeSegments.forEach(coordinates => {
                    L.polyline(coordinates, {
                        color: 'blue',
                        weight: 3,
                        opacity: 0.7
                    }).addTo(mapRef.current);
                });

                // Fit the map bounds to show all segments
                const allCoordinates = routeSegments.flat();
                mapRef.current.fitBounds(allCoordinates);
            } else {
                // Fallback to London center if no valid coordinates
                mapRef.current = L.map(mapContainerRef.current).setView([51.5074, -0.1278], 13);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapRef.current);
            }

            // Force a resize after map is created to ensure it fills container
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 100);
        }

        // Cleanup function to run when component unmounts
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
                image={imageUrl}
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
    route: PropTypes.string.isRequired,
};

export default BusCard;