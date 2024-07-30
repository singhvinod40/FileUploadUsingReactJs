import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './GoogleMap.css';

function GoogleMapComponent({ latitude, longitude }) {
    const [mapCenter, setMapCenter] = useState({ lat: latitude, lng: longitude });

    useEffect(() => {
        setMapCenter({ lat: latitude, lng: longitude });
    }, [latitude, longitude]);

    // Check if latitude and longitude are provided
    if (latitude === null || longitude === null) {
        return <div>Loading map...</div>;
    }

    return (
        <LoadScript googleMapsApiKey="AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ">
            <GoogleMap
                mapContainerClassName="map-container"
                center={mapCenter}
                zoom={10}
            >
                <Marker position={mapCenter} />
            </GoogleMap>
        </LoadScript>
    );
}

export default GoogleMapComponent;
