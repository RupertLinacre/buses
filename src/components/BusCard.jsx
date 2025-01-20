import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const BusCard = ({ busNumber, operatorName, imageUrl }) => {
    return (
        <Card sx={{ maxWidth: 345, m: 2 }}>
            <CardMedia
                component="img"
                height="140"
                image={imageUrl}
                alt={`Bus ${busNumber}`}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Bus {busNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {operatorName}
                </Typography>
            </CardContent>
        </Card>
    );
};

BusCard.propTypes = {
    busNumber: PropTypes.string.isRequired,
    operatorName: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
};

export default BusCard;