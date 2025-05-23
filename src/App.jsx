import { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatedHeader } from './components/AnimatedHeader';
import BusCard from './components/BusCard';
import Maps from './pages/Maps';
import routesData from './assets/routes.json';
import busesRidden from './assets/buses_ridden.json';

// Create a context to share the processed bus data
export const BusContext = createContext();

function App() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        // Create a map of service codes to counts
        const busRidesMap = Object.fromEntries(
            busesRidden.map(ride => [ride.service_code, ride.count])
        );

        // Get all images from the public/images directory at build time (both jpg and png, case insensitive)
        const jpgImages = import.meta.glob('/public/images/**/*.{jpg,JPG}', { eager: true });
        const pngImages = import.meta.glob('/public/images/**/*.{png,PNG}', { eager: true });

        const mappedBuses = routesData.map(bus => {
            const formattedServiceCode = bus.service_code.replace(':', '_');
            const basePattern = `/images/${bus.dataset_id}/${formattedServiceCode}`;

            // Find all matching images including alternatives
            const images = [];

            // Check for main jpg and png images
            const mainJpgPath = `/public${basePattern}.jpg`;
            const mainPngPath = `/public${basePattern}.png`;

            if (Object.keys(jpgImages).includes(mainJpgPath)) {
                images.push(`${basePattern}.jpg`);
            } else if (Object.keys(pngImages).includes(mainPngPath)) {
                images.push(`${basePattern}.png`);
            }

            // Check for alternative images
            Object.keys(jpgImages).forEach(path => {
                if (path.startsWith(`/public${basePattern}-alt`) && path.endsWith('.jpg')) {
                    images.push(path.replace('/public', ''));
                }
            });

            Object.keys(pngImages).forEach(path => {
                if (path.startsWith(`/public${basePattern}-alt`) && path.endsWith('.png')) {
                    images.push(path.replace('/public', ''));
                }
            });

            // Update rupert_ridden to include the count
            const rideCount = busRidesMap[bus.service_code] || 0;
            const rupert_ridden = rideCount > 0;

            // Update has_photo to check for any images
            const has_photo = images.length > 0;

            return {
                rupert_ridden,
                rideCount,
                has_photo,
                ...bus,
                images, // Now we store an array of image URLs
                route: bus.geom
            };
        });

        // Separate buses with and without images
        const busesWithImages = mappedBuses.filter(bus => bus.has_photo);
        const busesWithoutImages = mappedBuses.filter(bus => !bus.has_photo);

        // Take only first 20 buses without images
        const limitedBusesWithoutImages = busesWithoutImages.slice(0, 1000);

        // Sort by rupert_ridden first, then combine
        const sortedBuses = [...busesWithImages, ...limitedBusesWithoutImages].sort((a, b) => {
            if (a.rupert_ridden === b.rupert_ridden) return 0;
            return a.rupert_ridden ? -1 : 1;
        });

        // Set the sorted buses
        setBuses(sortedBuses);
    }, []);

    // Calculate statistics
    const photographedCount = buses.filter(bus => bus.has_photo).length;
    const totalRides = buses.reduce((sum, bus) => sum + (bus.rideCount || 0), 0);

    return (
        <BusContext.Provider value={buses}>
            <BrowserRouter basename="/buses">
                <Routes>
                    <Route path="/maps" element={<Maps />} />
                    <Route path="/" element={
                        <div className="relative min-h-screen py-5 w-screen overflow-hidden">
                            <div className="fixed inset-0 w-screen h-screen bg-repeat filter grayscale-90 brightness-110 -z-10"
                                style={{
                                    backgroundImage: 'url(./images/background.jpg)',
                                    backgroundSize: '400px'
                                }}>
                            </div>
                            <div className="max-w-7xl mx-auto py-4 bg-white/90 rounded-lg px-5">
                                <AnimatedHeader>
                                    RUPERT&apos;S BEST BUS WEBSITE EVER!
                                </AnimatedHeader>

                                {/* START: Add the Stats Card Here */}
                                <div className="bg-blue-100 border border-blue-300 px-3 py-1 rounded mb-4 text-blue-800 flex items-center gap-4 text-sm font-medium shadow-sm">
                                    <span>Buses Photographed: <span className="font-bold">{photographedCount}</span></span>
                                    <span>|</span>
                                    <span>Total Rides: <span className="font-bold">{totalRides}</span></span>
                                </div>
                                {/* END: Stats Card */}

                                <Link
                                    to="/maps"
                                    className="inline-block px-4 py-2 mb-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Go to Big Map
                                </Link>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {buses.map((bus) => (
                                        <div key={`${bus.dataset_id}-${bus.service_code}`}>
                                            <BusCard
                                                busNumber={bus.bus_number}
                                                operatorName={bus.operator_name}
                                                images={bus.images}
                                                route={bus.route}
                                                datasetId={bus.dataset_id}
                                                serviceName={bus.line_name}
                                                serviceCode={bus.service_code}
                                                rupert_ridden={bus.rupert_ridden}
                                                rideCount={bus.rideCount}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    } />
                </Routes>
            </BrowserRouter>
        </BusContext.Provider>
    );
}

export default App;