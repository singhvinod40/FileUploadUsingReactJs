import React, { useEffect, useState } from "react";
import axios from "axios";
import GoogleMapComponent from "../GoogleMap/GoogleMapComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DataDisplay = ({ fileUrl }) => {
    const [data, setData] = useState([]);
    const [dummydata, setDummyData] = useState([]);

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


    useEffect(() => {
        setDummyData([
            {
                data: "testing",
                lat: 12.923903688616994,
                long: 77.6845062113533
            }
        ]);

    }, []);

    const copyToClipbpard = () => {
        const dummydataString = dummydata.map((item) => item.data).join("\n");
        navigator.clipboard.writeText(dummydataString).then(() => {
            toast.success("Copied to clipboard !");
        }).catch((error) => {
            console.error("Error copying to clipboard:", error);
            toast.error("Failed to copy to clipboard!");

        });
    };

    return (

        <>
            < div className="data-display-container d-flex justify-content-center align-item-center">
                <div className="card" style={{ width: "50rem" }}>
                    <div className="card-body">
                        <h5 className="card-title">Exteacted Data</h5>

                        <p className="" card-text>
                            {dummydata && dummydata.length > 0 ? (
                                dummydata.map((element) => (
                                    <span key={element.data}> {element.data}</span>
                                ))
                            ) : (
                                <p> No data avaliable</p>)}
                        </p>

                        <button type="button" className="btn btn-outline-secondary btn-sm"
                            onClick={copyToClipbpard} > Copy to Clipboard</button>

                    </div>
                </div>
            </div>

            <div className="map-wrapper">
                {dummydata.length > 0 && (<GoogleMapComponent lat={dummydata[0].lat} long={dummydata[0].long} />)

                }
            </div>

            {/* Toast container */}
            <ToastContainer />


        </>



    );
};

export default DataDisplay;
