import { useState, useContext } from 'react';
import LeafletMap from '../components/LeafletMap';
import { BusContext } from '../App';

const Maps = () => {
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'ridden', or 'photos'
    const buses = useContext(BusContext);

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
            <LeafletMap
                routes={buses}
                filterMode={filterMode}
            />
        </div>
    );
};

export default Maps;