import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TbMapPinSearch } from "react-icons/tb";
import './SearchAdd.css';
import Spinner from "../spinner/Spinner";
import PlacesAutocomplete from 'react-places-autocomplete';
import GoogleMapComponent from '../GoogleMap/GoogleMapComponent';

const SearchAdd = () => {
    const [searchParam, setSearchParam] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null); // State to hold selected location data
    const [loading, setLoader] = useState(false);
    const [error, setError] = useState("");

    const fetchData = (value) => {
        setLoader(true);

        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value +
            '&key=AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ')
            .then((response) => response.json())
            .then((json) => {
                if (json.status === 'OK') {
                    const transformedResults = json.results.map(result => {
                        const addressInfo = {};

                        result.address_components.forEach(component => {
                            const { long_name, short_name, types } = component;
                            types.forEach(type => {
                                addressInfo[type] = `${long_name} (${short_name})`;
                            });
                        });

                        // Extract latitude and longitude
                        const { lat, lng } = result.geometry.location;
                        addressInfo["formatted_address"] = result.formatted_address;
                        addressInfo["latitude"] = lat;
                        addressInfo["longitude"] = lng;

                        return addressInfo;
                    });

                    setSearchResults(transformedResults);
                    // Set the selected location with lat and lng
                    if (transformedResults.length > 0) {
                        setSelectedLocation({
                            lat: transformedResults[0].latitude,
                            lng: transformedResults[0].longitude
                        });
                    }
                } else {
                    setError("No results found");
                }
                setLoader(false);
            })
            .catch((error) => {
                setError("Error fetching data");
                setLoader(false);
            });
    };

    const handleChange = (address) => {
        setSearchParam(address);
    };

    const handleSelect = (address) => {
        setSearchParam(address);
        fetchData(address);
    };

    const clearSearch = () => {
        setSearchParam('');
        setSearchResults([]);
        setError("");
        setSelectedLocation(null);
    };

    return (
        <>
            <Form>
                <div className="search-container">
                    <div className="search-box">
                        <PlacesAutocomplete
                            value={searchParam}
                            onChange={handleChange}
                            onSelect={handleSelect}
                        >
                            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div className="autocomplete-container">
                                    <input
                                        {...getInputProps({
                                            placeholder: 'Search Address....',
                                            className: 'location-search-input',
                                        })}
                                        required
                                        id="searchBox"
                                    />
                                    <TbMapPinSearch className="icon" />
                                    {suggestions.length > 0 && (
                                        <div className="autocomplete-dropdown-container">
                                            {loading && <div>Loading...</div>}
                                            {suggestions.map(suggestion => (
                                                <div
                                                    {...getSuggestionItemProps(suggestion, {
                                                        className: suggestion.active
                                                            ? 'suggestion-item--active'
                                                            : 'suggestion-item',
                                                    })}
                                                >
                                                    <span>{suggestion.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </PlacesAutocomplete>
                    </div>
                    <Button onClick={clearSearch} className="clear-button">Clear</Button>
                </div>
            </Form>

            <div className="data-display-container d-flex justify-content-center align-items-center">
                <div className="card" style={{ width: "50rem" }}>
                    <div className="card-body">
                        <h5 className="card-title">Address Information</h5>
                        {loading && <Spinner />}
                        <div className="card-text">
                            {!loading && searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                    <div key={index}>
                                        {Object.entries(result).map(([key, value]) => (
                                            <p key={key}><strong>{key}:</strong> {value}</p>
                                        ))}
                                    </div>
                                ))
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <p>No address data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Pass latitude and longitude to another component */}
            {/* {selectedLocation && (
                <GoogleMapComponent
                    latitude={selectedLocation.lat}
                    longitude={selectedLocation.lng}
                />
            )} */}

        </>
    );
};

export default SearchAdd;
