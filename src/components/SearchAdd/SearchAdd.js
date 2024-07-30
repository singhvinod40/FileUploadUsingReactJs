import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TbMapPinSearch } from "react-icons/tb";
import './SearchAdd.css';
import Spinner from "../spinner/Spinner";
import { toast, ToastContainer } from "react-toastify";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

const SearchAdd = () => {
    const [searchParam, setSearchParam] = useState('');
    const [debounceValue, setDebounceValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoader] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            if (debounceValue) {
                fetchData(debounceValue);
            }
        }, 500); // in milliseconds

        return () => {
            clearTimeout(handler); // Clear timeout if value changes before delay
        };
    }, [debounceValue]); // Depend on debounceValue to trigger effect

    const fetchData = (value) => {
        console.log("Searching for:", value);
        setLoader(true);

        fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value +
            '&key=AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ')
            .then((response) => response.json())
            .then((json) => {
                console.log("API Response:", json);
                logFormattedAddresses(json.results);
                setSearchResults(json.results); 
                setLoader(false);    
            }) 
            .catch((error) => {
                console.error("Error fetching data:", error);
                setError("Error fetching data");
                setLoader(false);
            });
    };

    const logFormattedAddresses = (results) => {
        results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`);
            console.log(`Formatted Address: ${result.formatted_address}`);
        });
    };

    const copyToClipboard = () => {
        const searchResultsString = JSON.stringify(searchResults, null, 2);

        navigator.clipboard.writeText(searchResultsString).then(() => {
            toast.success("Copied to clipboard!");
        }).catch((error) => {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy to clipboard!");
        });
    };

    const handleChange = (address) => {
        setSearchParam(address);
        setDebounceValue(address);
    };

    const clearSearch = () => {
        setSearchParam('');
        setSearchResults([]);
        setError("");
    }

    const handleSelect = (address) => {
        setSearchParam(address);
        setDebounceValue(address);
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
                                <div style={{ width: '100%' }}>
                                    <input
                                        {...getInputProps({
                                            placeholder: 'Search Address....',
                                            className: 'location-search-input',
                                        })}
                                        required
                                        id="searchBox"
                                    />
                                    <TbMapPinSearch className="icon" />
                                    <div className="autocomplete-dropdown-container">
                                        {loading && <div>Loading...</div>}
                                        {suggestions.map(suggestion => {
                                            const className = suggestion.active
                                                ? 'suggestion-item--active'
                                                : 'suggestion-item';
                                            const style = suggestion.active
                                                ? { backgroundColor: '#f0f0f0', cursor: 'pointer' }
                                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                            return (
                                                <div
                                                    {...getSuggestionItemProps(suggestion, {
                                                        className,
                                                        style,
                                                    })}
                                                >
                                                    <span>{suggestion.description}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                        <h5 className="card-title">Extracted Address By Geo Coding </h5>
                        {loading && <Spinner />}
                        <div className="card-text">
                            {!loading && searchResults.length > 0 ? (
                                <pre className="pretty-json">{JSON.stringify(searchResults, null, 2)}</pre>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <p>No address data available</p>
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyToClipboard}>
                                Copy to Clipboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* Toast container */}
            <ToastContainer />    
        </>
    );
}

export default SearchAdd;
