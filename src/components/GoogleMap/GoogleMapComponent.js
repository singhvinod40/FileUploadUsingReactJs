import React, { useEffect, useState, Suspense, lazy } from 'react';
import './GoogleMap.css';

// Lazy load GoogleMap and LoadScript components
const LoadScript = lazy(() => import('@react-google-maps/api').then(module => ({ default: module.LoadScript })));
const GoogleMap = lazy(() => import('@react-google-maps/api').then(module => ({ default: module.GoogleMap })));
const Marker = lazy(() => import('@react-google-maps/api').then(module => ({ default: module.Marker })));

function GoogleMapComponent({ latitude, longitude }) {
    const [mapCenter, setMapCenter] = useState({ lat: latitude, lng: longitude });
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    useEffect(() => {
        setMapCenter({ lat: latitude, lng: longitude });
    }, [latitude, longitude]);

    // Check if latitude and longitude are provided
    if (latitude === null || longitude === null) {
        return <div>Loading map...</div>;
    }

    return (
        <Suspense fallback={<div>Loading Google Maps...</div>}>
            <LoadScript googleMapsApiKey="AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ" onLoad={() => setIsMapLoaded(true)}>
                {isMapLoaded && (
                    <GoogleMap
                        mapContainerClassName="map-container"
                        center={mapCenter}
                        zoom={10}
                    >
                        <Marker position={mapCenter} />
                    </GoogleMap>
                )}
            </LoadScript>
        </Suspense>
    );
}

export default GoogleMapComponent;
