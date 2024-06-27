import React, { useEffect, useState } from "react";
import axios from "axios";
import GoogleMapComponent from "../GoogleMap/GoogleMapComponent";

const DataDisplay = ({ fileUrl }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/getData`, {
                    params: {
                        bucketLocation: fileUrl
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data from backend:", error.message);
            }
        };

        fetchData();
    }, [fileUrl]);

    return (
        <div className="data-display-container">
            <h2>Data Display</h2>
            <div className="card-group">
                {data && Object.keys(data).length > 0 ? (
                    <>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">State</h5>
                                <p className="card-text">{data.State}</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">Country</h5>
                                <p className="card-text">{data.Country}</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">Postal Code</h5>
                                <p className="card-text">{data.PostalCode}</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">City</h5>
                                <p className="card-text">{data.City}</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">Building Number and Street Name</h5>
                                <p className="card-text">{data.BuildingNumberAndStreetName}</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "18rem", margin: "10px" }}>
                            <div className="card-body">
                                <h5 className="card-title">Locality or Area</h5>
                                <p className="card-text">{data.LocalityOrArea}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>
            <div className="map-wrapper">
                <GoogleMapComponent />
            </div>
        </div>
    );
};

export default DataDisplay;
