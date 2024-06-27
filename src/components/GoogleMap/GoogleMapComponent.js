import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './GoogleMap.css';

const coordinate = {
    lat: 12.923903688616994,
    lng: 77.6845062113533
};

function GoogleMapComponent() {
    return (
        <LoadScript googleMapsApiKey="AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ">
            <GoogleMap
                mapContainerClassName="map-container"
                center={coordinate}
                zoom={10}
            >
                <Marker position={coordinate} />
            </GoogleMap>
        </LoadScript>
    );
}

export default GoogleMapComponent;
