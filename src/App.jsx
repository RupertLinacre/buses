import { useEffect, useState } from 'react';
import { Button, createTheme, ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatedHeader } from './components/AnimatedHeader';
import BusCard from './components/BusCard';
import Maps from './pages/Maps';
import routesData from './assets/routes.json';

function App() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        // Get all images from the public/images directory at build time
        const busImages = import.meta.glob('/public/images/**/*.jpg', { eager: true });

        const mappedBuses = routesData.map(bus => {
            const imagePath = `/images/${bus.dataset_id}/${bus.bus_number}.jpg`;
            // Get the full public path that would match our image
            const fullImagePath = `/public/images/${bus.dataset_id}/${bus.bus_number}.jpg`;

            // Only set imageUrl if we explicitly find the image in our glob
            const imageUrl = Object.keys(busImages).includes(fullImagePath) ? imagePath : null;

            return {
                ...bus,
                imageUrl,
                route: bus.geom
            };
        });

        // Sort buses - ones with images come first
        const sortedBuses = mappedBuses.sort((a, b) => {
            if (a.imageUrl && !b.imageUrl) return -1;
            if (!a.imageUrl && b.imageUrl) return 1;
            return 0;
        });

        setBuses(sortedBuses);
    }, []);

    const theme = createTheme({
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        palette: {
            background: {
                default: 'transparent',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter basename="/vite_bus">
                <div className="relative min-h-screen py-5 w-screen overflow-hidden">
                    <div className="fixed inset-0 w-screen h-screen bg-repeat filter grayscale-90 brightness-110 -z-10"
                        style={{
                            backgroundImage: 'url(./images/background.jpg)',
                            backgroundSize: '400px'
                        }}>
                    </div>
                    <Routes>
                        <Route path="/" element={
                            <div className="max-w-7xl mx-auto py-4 bg-white/90 rounded-lg px-5">
                                <AnimatedHeader>
                                    RUPERT&apos;S BEST BUS WEBSITE EVER!
                                </AnimatedHeader>

                                <Button
                                    component={Link}
                                    to="/maps"
                                    variant="contained"
                                    className="mb-3"
                                >
                                    Go to Big Map
                                </Button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {buses.map((bus) => (
                                        <div key={`${bus.dataset_id}-${bus.bus_number}`}>
                                            <BusCard
                                                busNumber={bus.bus_number}
                                                operatorName={bus.operator_name}
                                                imageUrl={bus.imageUrl}
                                                route={bus.route}
                                                datasetId={bus.dataset_id}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        } />
                        <Route path="/maps" element={<Maps />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;