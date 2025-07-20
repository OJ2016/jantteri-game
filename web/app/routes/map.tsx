import { useEffect, useState } from 'react';

export function meta() {
    return [
        { title: "Map - Jantteri Game" },
        { name: "description", content: "MML Map centered on Tampere" },
    ];
}

export default function Map() {
    const [MapComponent, setMapComponent] = useState<any>(null);

    useEffect(() => {
        // Dynamic import only on client side
        const loadMap = async () => {
            try {
                // Import CSS first
                await import('leaflet/dist/leaflet.css');

                // Then import react-leaflet components
                const { MapContainer, TileLayer, CircleMarker, Popup } = await import('react-leaflet');

                // Create the map component
                const MapComp = () => (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <MapContainer
                            center={[61.4978, 23.7610]}
                            zoom={10}
                            className="w-full h-[500px] md:h-[600px]"
                            maxZoom={18}
                            minZoom={5}
                        >
                            <TileLayer
                                url="/map-tiles/{z}/{x}/{y}.png"
                                maxZoom={18}
                                attribution="© National Land Survey of Finland (MML)"
                            />
                            <CircleMarker
                                center={[61.4978, 23.7610]}
                                radius={8}
                                fillColor="#ff0000"
                                color="#ffffff"
                                weight={2}
                                opacity={1}
                                fillOpacity={0.8}
                            >
                                <Popup>Tampere, Finland</Popup>
                            </CircleMarker>
                        </MapContainer>
                    </div>
                );

                setMapComponent(() => MapComp);
            } catch (error) {
                console.error('Failed to load map:', error);
            }
        };

        loadMap();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Tampere Map</h1>
                {MapComponent ? (
                    <MapComponent />
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center bg-gray-100">
                            <div className="text-gray-500">Loading map...</div>
                        </div>
                    </div>
                )}
                <p className="mt-3 text-sm text-gray-500 text-center">
                    Map data © National Land Survey of Finland (MML)
                </p>
            </div>
        </div>
    );
}
