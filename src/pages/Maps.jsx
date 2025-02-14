import { useState } from 'react';
import LeafletMap from '../components/LeafletMap';
import routesData from '../assets/routes.json';
import busesRidden from '../assets/buses_ridden.json';

const Maps = () => {
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'ridden', or 'photos'

    // Process the routes data once, including image checks
    const processedRoutes = routesData.map(bus => {
        // Get all images from the public/images directory at build time
        const jpgImages = import.meta.glob('/public/images/**/*.{jpg,JPG}', { eager: true });
        const pngImages = import.meta.glob('/public/images/**/*.{png,PNG}', { eager: true });

        const formattedServiceCode = bus.service_code.replace(':', '_');
        const jpgPath = `/images/${bus.dataset_id}/${formattedServiceCode}.jpg`;
        const fullJpgPath = `/public${jpgPath}`;
        const pngPath = `/images/${bus.dataset_id}/${formattedServiceCode}.png`;
        const fullPngPath = `/public${pngPath}`;

        // Check if image exists
        const has_photo = Object.keys(jpgImages).includes(fullJpgPath) ||
            Object.keys(pngImages).includes(fullPngPath);

        return {
            ...bus,
            rupert_ridden: busesRidden.includes(bus.service_code),
            has_photo
        };
    });

    // Filter buses based on selected mode
    const getFilteredBuses = () => {
        switch (filterMode) {
            case 'ridden':
                return processedRoutes.filter(bus => bus.rupert_ridden);
            case 'photos':
                return processedRoutes.filter(bus => bus.has_photo);
            default:
                return processedRoutes;
        }
    };

    return (
        <div className="h-screen w-screen p-0 m-0 absolute top-0 left-0 fullscreen-map">
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-2">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setFilterMode('all')}
                        className={`px-4 py-2 rounded ${filterMode === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        All Buses
                    </button>
                    <button
                        onClick={() => setFilterMode('ridden')}
                        className={`px-4 py-2 rounded ${filterMode === 'ridden'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        Buses Ridden
                    </button>
                    <button
                        onClick={() => setFilterMode('photos')}
                        className={`px-4 py-2 rounded ${filterMode === 'photos'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        Buses with Photos
                    </button>
                </div>
            </div>
            <LeafletMap routes={getFilteredBuses()} />
        </div>
    );
};

export default Maps;