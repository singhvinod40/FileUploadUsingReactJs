import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './DataDisplay.css';
import Spinner from "../spinner/Spinner";

const DataDisplay = ({ fileUrl }) => {
    const [address, setAddress] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoader] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            console.log("File URL uploaded: " + fileUrl);
            try {
                setLoader(true);
                const response = await axios.post('http://localhost:5000/process-document', {
                    fileUrl: fileUrl
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 200) {
                    const { address } = response.data;
                    setAddress(address);
                    setLoader(false);
                    console.log("Address data: ", address);
                } else {
                    setError(`Error: ${response.data.error}`);
                }
            } catch (error) {
                setError(`Error: ${error.message}`);
            }
        };

        fetchData();
    }, [fileUrl]);

    const copyToClipboard = () => {
        const addressString = JSON.stringify(address, null, 2);

        navigator.clipboard.writeText(addressString).then(() => {
            toast.success("Copied to clipboard!");
        }).catch((error) => {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy to clipboard!");
        });
    };

    return (
        <>
            <div className="data-display-container d-flex justify-content-center align-items-center">
                <div className="card" style={{ width: "50rem" }}>
                    <div className="card-body">
                        <h5 className="card-title">Extracted Address</h5>
                        {loading && <Spinner />}
                        <div className="card-text">
                            {!loading && address ? (
                                <pre className="pretty-json">{JSON.stringify(address, null, 2)}</pre>
                            ) : error ? (
                                <p>{error}</p>
                            ) : (
                                <p>No address data available</p>
                            )}
                        </div>

                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyToClipboard}>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
            {/* Toast container */}
            <ToastContainer />
        </>
    );
};

export default DataDisplay;
