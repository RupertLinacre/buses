import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import routesData from '../assets/routes.json';

const LeafletMap = () => {
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

    // Function to generate distinct colors for each route
    const getRouteColor = (index) => {
        const colors = [
            '#FF0000', // Red
            '#00FF00', // Green
            '#0000FF', // Blue
            '#FFA500', // Orange
            '#800080', // Purple
            '#00FFFF', // Cyan
            '#FF00FF', // Magenta
            '#008000', // Dark Green
            '#000080', // Navy
            '#800000', // Maroon
            '#808000', // Olive
            '#008080', // Teal
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        // Initialize map if it hasn't been initialized yet
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([51.5074, -0.1278], 10);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
            }).addTo(mapRef.current);

            const allCoordinates = [];

            // Plot each bus route
            routesData.forEach((bus, index) => {
                const routeSegments = parseMultiLineString(bus.multilinestring);
                const color = getRouteColor(index);

                if (routeSegments.length > 0) {
                    // Add each route segment as a separate polyline
                    routeSegments.forEach(coordinates => {
                        if (coordinates.length > 0) {
                            L.polyline(coordinates, {
                                color: color,
                                weight: 3,
                                opacity: 0.7
                            }).addTo(mapRef.current);

                            // Collect all coordinates for bounds calculation
                            allCoordinates.push(...coordinates);
                        }
                    });

                    // Add a label for the bus number at the first coordinate of the first segment
                    if (routeSegments[0].length > 0) {
                        L.marker(routeSegments[0][0], {
                            icon: L.divIcon({
                                className: 'bus-label',
                                html: `<div style="
                                    background-color: ${color};
                                    color: white;
                                    padding: 5px 8px;
                                    border-radius: 3px;
                                    white-space: nowrap;
                                    display: inline-block;
                                    font-size: 14px;
                                ">${bus.bus_number}</div>`,
                            })
                        }).addTo(mapRef.current);
                    }
                }
            });

            // Fit the map bounds to show all segments if there are coordinates
            if (allCoordinates.length > 0) {
                mapRef.current.fitBounds(allCoordinates, { padding: [50, 50] });
            }
        }

        // Cleanup function to run when component unmounts
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
};

export default LeafletMap;