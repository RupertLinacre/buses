import LeafletMap from '../components/LeafletMap';

const Maps = () => {
    return (
        <div className="h-screen w-screen p-0 m-0 absolute top-0 left-0 fullscreen-map">
            <LeafletMap />
        </div>
    );
};

export default Maps;