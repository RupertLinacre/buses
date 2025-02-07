import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-geometryutil';
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

    // Helper function to get the midpoint of a route
    const getRouteMidpoint = (geometry) => {
        if (geometry.type === 'LineString' && geometry.coordinates.length > 0) {
            const midIndex = Math.floor(geometry.coordinates.length / 2);
            return [geometry.coordinates[midIndex][1], geometry.coordinates[midIndex][0]];
        }
        return null;
    };

    // Helper function to find nearest point on polyline
    const getNearestPointOnLine = (latlng, geometry) => {
        if (geometry.type === 'LineString') {
            const latLngs = geometry.coordinates.map(coord => L.latLng(coord[1], coord[0]));
            return L.GeometryUtil.closest(mapRef.current, latLngs, latlng);
        }
        return latlng;
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
                        let isDragging = false;
                        let activeGeometry = null;

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

                        // Create the label with initial position at route midpoint
                        const initialPosition = getRouteMidpoint(bus.geom.features[0].geometry) || [51.5074, -0.1278];
                        const labelRef = L.marker(initialPosition, {
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
                                    cursor: move;
                                ">${bus.bus_number}</div>`,
                                iconSize: null,
                                iconAnchor: [15, 15]
                            })
                        }).addTo(mapRef.current);

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
                                    if (!isDragging) {
                                        layer.setStyle({
                                            weight: 5,
                                            opacity: 1
                                        });
                                        layer.bringToFront();
                                        popup.setLatLng(e.latlng).openOn(mapRef.current);
                                    }
                                    activeGeometry = feature.geometry;
                                });

                                layer.on('mouseout', (e) => {
                                    if (!isDragging) {
                                        layer.setStyle({
                                            weight: 3,
                                            opacity: 0.7
                                        });
                                        mapRef.current.closePopup();
                                        activeGeometry = null;
                                    }
                                });

                                layer.on('mousemove', (e) => {
                                    if (isDragging && activeGeometry) {
                                        const nearestPoint = getNearestPointOnLine(e.latlng, activeGeometry);
                                        labelRef.setLatLng(nearestPoint);
                                        // Keep the route highlighted while dragging
                                        layer.setStyle({
                                            weight: 5,
                                            opacity: 1
                                        });
                                        layer.bringToFront();
                                    }
                                    popup.setLatLng(e.latlng);
                                });
                            }
                        }).addTo(mapRef.current);

                        // Make label draggable
                        const labelElement = labelRef.getElement();

                        labelElement.addEventListener('mousedown', (e) => {
                            isDragging = true;
                            mapRef.current.closePopup();
                            e.stopPropagation();
                            // Find and highlight the route on drag start
                            routeLayer.eachLayer(layer => {
                                layer.setStyle({
                                    weight: 5,
                                    opacity: 1
                                });
                                layer.bringToFront();
                            });
                        });

                        labelElement.addEventListener('mouseover', (e) => {
                            e.stopPropagation();
                        });

                        document.addEventListener('mouseup', () => {
                            isDragging = false;
                            activeGeometry = null;
                            // Reset route style on drag end
                            routeLayer.eachLayer(layer => {
                                layer.setStyle({
                                    weight: 3,
                                    opacity: 0.7
                                });
                            });
                        });

                        // Add mousemove listener to map for dragging
                        mapRef.current.on('mousemove', (e) => {
                            if (isDragging && activeGeometry) {
                                const nearestPoint = getNearestPointOnLine(e.latlng, activeGeometry);
                                labelRef.setLatLng(nearestPoint);
                            }
                        });
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