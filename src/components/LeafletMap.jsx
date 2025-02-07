import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import routesData from '../assets/routes.json';

const LeafletMap = () => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Function to generate distinct colors for each route
    const getRouteColor = (index) => {
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', '#00FFFF',
            '#FF00FF', '#008000', '#000080', '#800000', '#808000', '#008080',
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([51.5074, -0.1278], 10);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
            }).addTo(mapRef.current);

            // Plot each bus route
            routesData.forEach((bus, index) => {
                try {
                    if (bus.geom && bus.geom.features && bus.geom.features[0]?.geometry) {
                        const color = getRouteColor(index);
                        let labelRef = null; // Store reference to the label

                        // Create formatted popup content
                        const popupContent = `
                            <div style="font-family: Arial, sans-serif; padding: 5px;">
                                <h3 style="margin: 0 0 8px 0; color: ${color};">Route ${bus.bus_number}</h3>
                                <table style="border-spacing: 4px;">
                                    <tr>
                                        <td><strong>Line Name:</strong></td>
                                        <td>${bus.line_name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Operator:</strong></td>
                                        <td>${bus.operator_name || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Service Code:</strong></td>
                                        <td>${bus.service_code || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Dataset ID:</strong></td>
                                        <td>${bus.dataset_id || 'N/A'}</td>
                                    </tr>
                                </table>
                            </div>
                        `;

                        // Create a GeoJSON layer for the route with popup
                        const routeLayer = L.geoJSON(bus.geom, {
                            style: {
                                color: color,
                                weight: 3,
                                opacity: 0.7
                            },
                            onEachFeature: (feature, layer) => {
                                const popup = L.popup({
                                    closeButton: false,
                                    offset: L.point(0, -10)
                                }).setContent(popupContent);

                                layer.on('mouseover', (e) => {
                                    layer.setStyle({
                                        weight: 5,
                                        opacity: 1
                                    });
                                    if (labelRef) {
                                        labelRef.getElement().style.zIndex = 9999;
                                        setTimeout(() => labelRef.bringToFront(), 0);
                                    }
                                    layer.bringToFront();
                                    popup.setLatLng(e.latlng).openOn(mapRef.current);
                                });

                                layer.on('mouseout', (e) => {
                                    layer.setStyle({
                                        weight: 3,
                                        opacity: 0.7
                                    });
                                    if (labelRef) {
                                        labelRef.getElement().style.zIndex = '';
                                    }
                                    mapRef.current.closePopup();
                                });

                                layer.on('mousemove', (e) => {
                                    popup.setLatLng(e.latlng);
                                });
                            }
                        }).addTo(mapRef.current);

                        // Add label and store reference
                        const firstFeature = bus.geom.features[0];
                        if (firstFeature.geometry.coordinates && firstFeature.geometry.coordinates[0]) {
                            const coords = firstFeature.geometry.coordinates[0];
                            const [lng, lat] = Array.isArray(coords[0]) ? coords[0] : coords;

                            labelRef = L.marker([lat, lng], {
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
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                        z-index: 1000;
                                    ">${bus.bus_number}</div>`,
                                    iconSize: null,
                                    iconAnchor: [15, 15]
                                })
                            }).addTo(mapRef.current);
                        }
                    }
                } catch (error) {
                    console.error(`Error handling route for bus ${bus.bus_number}:`, error);
                }
            });

            // Fit bounds to show all routes
            const allLayers = L.geoJSON(routesData.map(bus => bus.geom));
            const bounds = allLayers.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }

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