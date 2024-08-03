import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Pagination } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ValidateDbObject.css';

function ValidateDbObject() {
    const [data, setData] = useState([]);
    const [selectedCellValue, setSelectedCellValue] = useState(null);
    const [correspondingValue, setCorrespondingValue] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/getAllAddress');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    const handleCellClick = (unstructuredValue, structuredValue, addressId) => {
        setSelectedCellValue(unstructuredValue);
        setCorrespondingValue(structuredValue);
        setSelectedAddressId(addressId);
    };

    const handleButtonClick = async () => {
        if (correspondingValue && correspondingValue.Address) {
            console.log('Address field has a value:', correspondingValue.Address);
            toast.success("Already Structured");
            return;
        }

        console.log('Selected Cell Value:', selectedCellValue);

        try {
            toast.info("Converting to Structured Address");
            const response = await axios.post('http://localhost:5000/validate-address', {
                address: selectedCellValue,
                apiKey: 'AIzaSyBNX9OW_g03948v05K-k49thC79wLBCJcQ',
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = response.data;
            console.log("API Response:", json);

            if (json && json.address) {
                console.log("Structured address from API:", json.address);
                await updateAddressInJavaAPI(json.address);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error fetching structured address");
        }
    };

    const updateAddressInJavaAPI = async (structuredAddress) => {
        try {
            const response = await axios.put('http://localhost:8080/updateAddress', {
                structuredAddress: structuredAddress,
                addressId: selectedAddressId,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json = response.data;
            console.log("API Response:", json);

            if (json && json.address) {
                console.log("Structured address from API:", json.address);
                toast.info("Address updated successfully");
                fetchData(); // Refresh the table data after updating
            }
            toast.success("Converted SuccessFully")
        } catch (error) {
            console.error("Error updating data:", error);
            toast.error("Error updating address");
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="d-flex my-2">
                <Button type="button" variant="outline-dark" onClick={handleButtonClick}>
                    Convert to Structured Address
                </Button>
                <Button type="button" variant="outline-dark" onClick={fetchData} className="ml-2">
                    Refresh Data
                </Button>
            </div>

            <div className="container">
                <div className="table-container">
                    <table className="table table-striped table-outline">
                        <thead>
                            <tr>
                                <th scope="col">UnStructured</th>
                                <th scope="col">Structured</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, index) => (
                                <tr key={index}>
                                    <td
                                        className={`selectable-cell ${selectedCellValue === item.Unstructured.address ? 'selected' : ''}`}
                                        onClick={() => handleCellClick(item.Unstructured.address, item.Structured, item.addressId)}
                                    >
                                        {item.Unstructured.address}
                                    </td>
                                    <td>
                                        {Object.entries(item.Structured).map(([key, value]) => (
                                            <div key={key}><strong>{key}:</strong> {value}</div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <Pagination className="pagination-controls">
                        {[...Array(totalPages).keys()].map((pageNumber) => (
                            <Pagination.Item
                                key={pageNumber + 1}
                                active={pageNumber + 1 === currentPage}
                                onClick={() => handlePageChange(pageNumber + 1)}
                            >
                                {pageNumber + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </div>
            </div>

            {/* Toast container */}
            <ToastContainer position="top-right" />
        </>
    );
}

export default ValidateDbObject;
