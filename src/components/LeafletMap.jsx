import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-geometryutil';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';

const LeafletMap = ({ routes, filterMode }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

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
            return L.GeometryUtil.closest(mapInstanceRef.current, latLngs, latlng);
        }
        return latlng;
    };

    useEffect(() => {
        // Initialize map if it doesn't exist
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([51.5074, -0.1278], 10);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
            }).addTo(mapInstanceRef.current);
        }

        // Clear existing layers
        mapInstanceRef.current.eachLayer((layer) => {
            if (!(layer instanceof L.TileLayer)) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Filter routes based on the current filter mode
        const filteredRoutes = routes.filter((bus) => {
            if (filterMode === 'all') return true;
            if (filterMode === 'ridden') return bus.rupert_ridden;
            if (filterMode === 'photos') return bus.has_photo;
            return true;
        });

        // Plot each bus route
        filteredRoutes.forEach((bus, index) => {
            try {
                if (bus.geom && bus.geom.features && bus.geom.features[0]?.geometry) {
                    // Use distinct colors for each route
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
                    }).addTo(mapInstanceRef.current);

                    // Create a GeoJSON layer for the route with popup
                    const routeLayer = L.geoJSON(bus.geom, {
                        style: {
                            color: color,
                            weight: bus.rupert_ridden ? 4 : 3,
                            opacity: bus.rupert_ridden ? 0.8 : 0.7
                        },
                        onEachFeature: (feature, layer) => {
                            const popup = L.popup({
                                closeButton: false,
                                offset: L.point(0, -10)
                            }).setContent(popupContent);

                            layer.on('mouseover', (e) => {
                                if (!isDragging) {
                                    layer.setStyle({
                                        weight: bus.rupert_ridden ? 6 : 5,
                                        opacity: 1
                                    });
                                    layer.bringToFront();
                                    popup.setLatLng(e.latlng).openOn(mapInstanceRef.current);
                                }
                                activeGeometry = feature.geometry;
                            });

                            layer.on('mouseout', (e) => {
                                if (!isDragging) {
                                    layer.setStyle({
                                        weight: bus.rupert_ridden ? 4 : 3,
                                        opacity: bus.rupert_ridden ? 0.8 : 0.7
                                    });
                                    mapInstanceRef.current.closePopup();
                                    activeGeometry = null;
                                }
                            });

                            layer.on('mousemove', (e) => {
                                if (isDragging && activeGeometry) {
                                    const nearestPoint = getNearestPointOnLine(e.latlng, activeGeometry);
                                    labelRef.setLatLng(nearestPoint);
                                    layer.setStyle({
                                        weight: bus.rupert_ridden ? 6 : 5,
                                        opacity: 1
                                    });
                                    layer.bringToFront();
                                }
                                popup.setLatLng(e.latlng);
                            });
                        }
                    }).addTo(mapInstanceRef.current);

                    // Make label draggable
                    const labelElement = labelRef.getElement();

                    labelElement.addEventListener('mousedown', (e) => {
                        isDragging = true;
                        mapInstanceRef.current.closePopup();
                        e.stopPropagation();
                        routeLayer.eachLayer(layer => {
                            layer.setStyle({
                                weight: bus.rupert_ridden ? 6 : 5,
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
                        routeLayer.eachLayer(layer => {
                            layer.setStyle({
                                weight: bus.rupert_ridden ? 4 : 3,
                                opacity: bus.rupert_ridden ? 0.8 : 0.7
                            });
                        });
                    });

                    // Add mousemove listener to map for dragging
                    mapInstanceRef.current.on('mousemove', (e) => {
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

        // Fit bounds to show filtered routes
        if (filteredRoutes.length > 0) {
            const allLayers = L.geoJSON(filteredRoutes.map(bus => bus.geom));
            const bounds = allLayers.getBounds();
            if (bounds.isValid()) {
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
        }

    }, [routes, filterMode]); // Add filterMode to dependencies

    return <div ref={mapRef} className="h-full w-full" />;
};

LeafletMap.propTypes = {
    routes: PropTypes.arrayOf(PropTypes.shape({
        bus_number: PropTypes.string,
        operator_name: PropTypes.string,
        service_code: PropTypes.string,
        dataset_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        line_name: PropTypes.string,
        geom: PropTypes.object,
        rupert_ridden: PropTypes.bool,
        has_photo: PropTypes.bool
    })).isRequired,
    filterMode: PropTypes.oneOf(['all', 'ridden', 'photos']).isRequired
};

export default LeafletMap;