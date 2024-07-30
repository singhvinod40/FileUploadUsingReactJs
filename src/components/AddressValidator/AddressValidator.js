import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { TbMapPinSearch } from "react-icons/tb";
import './AddressValidator.css';
import Spinner from "../spinner/Spinner";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import ValidateDbObject from './ValidateDbObject';

const AddressValidator = () => {
    const [searchParam, setSearchParam] = useState('');
    const [debounceValue, setDebounceValue] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoader] = useState(false);
    const [error, setError] = useState("");
    const [isValid, setIsValid] = useState(null);
    const [isDbValidation, setIsDbValidation] = useState(false); // Toggle state

    useEffect(() => {
        if (debounceValue && !isDbValidation) {
            const handler = setTimeout(async () => {
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

                    if (json && json.address) {
                        setSearchResults(json.address);
                        setIsValid(json.valid);
                    } else {
                        setSearchResults(null);
                        setError("Invalid response structure");
                        setIsValid(null);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setError("Error fetching data");
                    setIsValid(null);
                } finally {
                    setLoader(false);
                }
            }, 1500);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [debounceValue, isDbValidation]);

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
        setDebounceValue(value);
    };

    const clearSearch = () => {
        setSearchParam('');
        setSearchResults(null);
        setError(""); // Clear error when clearing search
        setIsValid(null);
    };

    const handleToggle = () => {
        setIsDbValidation(prevState => !prevState);
        setSearchParam('');
        setSearchResults(null);
        setError("");
        setIsValid(null);
    };

    return (
        <>
            <div className="toggle-container">
                <label className="switch">
                    <input type="checkbox" checked={isDbValidation} onChange={handleToggle} />
                    <span className="slider round"></span>
                </label>
                <span className="toggle-label">{isDbValidation ? 'Validate Exidting Address' : 'User Input'}</span>
            </div>

            {!isDbValidation && (
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
            )}

            {isDbValidation && <ValidateDbObject />}

            {!isDbValidation && (
                <div className="data-display-container d-flex justify-content-center align-items-center">
                    <div className="card" style={{ width: "50rem" }}>
                        {isValid !== null && (
                            <span className={`badge rounded-pill ${isValid ? 'bg-success' : 'bg-warning'}`}>
                                {isValid ? 'Valid address' : 'Invalid address'}
                            </span>
                        )}
                        <div className="card-body">
                            <h5 className="card-title">Address validation</h5>
                            {loading && <Spinner />}
                            <div className="card-text">
                                {!loading && searchResults ? (
                                    <div className="small-text">
                                        <p><strong>Address:</strong> {searchResults.Address}</p>
                                        <p><strong>Building Number:</strong> {searchResults.BldgNb}</p>
                                        <p><strong>Country:</strong> {searchResults.Ctry}</p>
                                        <p><strong>State/Province:</strong> {searchResults.CtrySubDvsn}</p>
                                        <p><strong>Department:</strong> {searchResults.Dept}</p>
                                        <p><strong>Floor:</strong> {searchResults.Flr}</p>
                                        <p><strong>Name:</strong> {searchResults.Name}</p>
                                        <p><strong>Post Box:</strong> {searchResults.PstBx}</p>
                                        <p><strong>Postal Code:</strong> {searchResults.PstCd}</p>
                                        <p><strong>Room:</strong> {searchResults.Room}</p>
                                        <p><strong>Street Name:</strong> {searchResults.StrtNm}</p>
                                        <p><strong>Town Name:</strong> {searchResults.TwnNm}</p>
                                    </div>
                                ) : !loading && !searchResults && !error ? (
                                    <p>No Validation data available</p>
                                ) : error ? (
                                    <p>{error}</p>
                                ) : null}
                            </div>

                            {searchResults && (
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyToClipboard}>
                                    Copy to Clipboard
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
}

export default AddressValidator;
