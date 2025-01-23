import { useEffect, useState } from 'react';
import { Container, Grid, Button } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AnimatedHeader } from './components/AnimatedHeader';
import BusCard from './components/BusCard';
import Maps from './pages/Maps';
import routesData from './assets/routes.json';

function App() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        // Get all images from the public/images directory at build time
        const busImages = import.meta.glob('/public/images/*.jpg', { eager: true });

        console.log('Available images:', Object.keys(busImages));

        const mappedBuses = routesData.map(bus => {
            const imagePath = `/images/${bus.bus_number}.jpg`;
            // Check if the image exists in our glob
            const hasImage = Object.keys(busImages).some(path =>
                path.includes(`${bus.bus_number}.jpg`)
            );

            return {
                ...bus,
                imageUrl: hasImage ? imagePath : null,
                route: bus.geom
            };
        });

        setBuses(mappedBuses);
    }, []);

    return (
        <BrowserRouter basename="/vite_bus">
            <Routes>
                <Route path="/" element={
                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <AnimatedHeader>
                            RUPERT&apos;S BEST BUS WEBSITE EVER!
                        </AnimatedHeader>

                        <Button
                            component={Link}
                            to="/maps"
                            variant="contained"
                            sx={{ mb: 3 }}
                        >
                            Go to Big Map
                        </Button>
                        <Grid container spacing={3}>
                            {buses.map((bus) => (
                                <Grid item xs={12} sm={6} md={4} key={bus.bus_number}>
                                    <BusCard
                                        busNumber={bus.bus_number}
                                        operatorName={bus.operator_name}
                                        imageUrl={bus.imageUrl}
                                        route={bus.route}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                } />
                <Route path="/maps" element={<Maps />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;