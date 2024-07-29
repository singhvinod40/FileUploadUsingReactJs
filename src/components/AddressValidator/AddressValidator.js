import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TbMapPinSearch } from "react-icons/tb";
import './AddressValidator.css';
import Spinner from "../spinner/Spinner";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const AddressValidator = () => {

    const [searchParam, setSearchParam] = useState('');
    const [debounceValue, setDebounceValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoader] = useState(false); // Set default loading to false
    const [error, setError] = useState("");

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (debounceValue) {
                console.log("Searching for:", debounceValue);
                setLoader(true);

                try {
                    const response = await axios.post('http://localhost:5000/validate-address', {
                        address: debounceValue,
                        apiKey: 'AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ',
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const json = response.data;
                    console.log("API Response:", json);
                    logFormattedAddresses(json.results);
                    setSearchResults(json.results);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setError("Error fetching data");
                } finally {
                    setLoader(false);
                }
            }
        }, 1500); // in milliseconds

        return () => {
            clearTimeout(handler); // Clear timeout if value changes before delay
        };
    }, [debounceValue]);

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

    const handleChange = (value) => {
        setSearchParam(value);
        setDebounceValue(value); // Update debounceValue to trigger useEffect
    };

    const clearSearch = () => {
        setSearchParam('');
        setSearchResults('');
    };

    return (
        <>
            <Form>
                <div className="search-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search Address...."
                            required
                            id="searchBox"
                            value={searchParam}
                            onChange={(e) => handleChange(e.target.value)}
                        />
                        <TbMapPinSearch className="icon" />
                    </div>
                    <Button onClick={clearSearch} className="clear-button">Clear</Button>
                </div>
            </Form>

            <div className="data-display-container d-flex justify-content-center align-items-center">
                <div className="card" style={{ width: "50rem" }}>
                    <div className="card-body">
                        <h5 className="card-title">Address validation  </h5>
                        {loading && <Spinner />}
                        <div className="card-text">
                            {!loading && searchResults.length > 0 ? (
                                <pre className="pretty-json">{JSON.stringify(searchResults, null, 2)}</pre>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <p>No Validation data available</p>
                            )}
                        </div>

                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyToClipboard}>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default AddressValidator;
