import { useEffect, useState } from 'react';
import { Container, Grid, Button, createTheme, ThemeProvider } from '@mui/material';
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

        const mappedBuses = routesData.map(bus => {
            const imagePath = `/images/${bus.bus_number}.jpg`;
            // Get the full public path that would match our image
            const fullImagePath = `/public/images/${bus.bus_number}.jpg`;

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
                <div style={{
                    position: 'relative',
                    minHeight: '100vh',
                    padding: '20px 0',
                    background: 'none',
                    width: '100vw',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundImage: 'url(./images/background.jpg)',
                        backgroundSize: '400px',
                        backgroundRepeat: 'repeat',
                        filter: 'grayscale(90%) brightness(1.1)',
                        zIndex: -1
                    }} />
                    <Routes>
                        <Route path="/" element={
                            <Container maxWidth="lg" sx={{
                                py: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
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
                                        <Grid item xs={12} sm={6} md={4} key={`${bus.dataset_id}-${bus.bus_number}`}>
                                            <BusCard
                                                busNumber={bus.bus_number}
                                                operatorName={bus.operator_name}
                                                imageUrl={bus.imageUrl}
                                                route={bus.route}
                                                datasetId={bus.dataset_id}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Container>
                        } />
                        <Route path="/maps" element={<Maps />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;