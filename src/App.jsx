import { useEffect, useState } from 'react';
import { Container, Grid } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BusCard from './components/BusCard';
import Maps from './pages/Maps';
import routesData from './assets/routes.json';

function App() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        setBuses(routesData.map(bus => ({
            ...bus,
            imageUrl: `/images/${bus.bus_number}.png`
        })));
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <Link to="/maps">Go to Maps</Link>
                        <Grid container spacing={3}>
                            {buses.map((bus) => (
                                <Grid item xs={12} sm={6} md={4} key={bus.bus_number}>
                                    <BusCard
                                        busNumber={bus.bus_number}
                                        operatorName={bus.operator_name}
                                        imageUrl={bus.imageUrl}
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