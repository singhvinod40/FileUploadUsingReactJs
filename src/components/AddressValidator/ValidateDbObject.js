import React, { useState } from 'react';
import { Button, Pagination } from 'react-bootstrap';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './ValidateDbObject.css';

function ValidateDbObject() {
    // State to manage selected cell value and its corresponding value
    const [selectedCellValue, setSelectedCellValue] = useState(null);
    const [correspondingValue, setCorrespondingValue] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Adjust this value as needed

    // Sample data, simulating an API response with additional entries
    const sampleData = [
        {
            "Unstructured": { "address": "123 Main St" },
            "Structured": {
                "Address": "123 Main St",
                "BldgNb": "123",
                "Ctry": "AU",
                "CtrySubDvsn": "VIC",
                "Dept": "N/A",
                "Flr": "N/A",
                "Name": "N/A",
                "PstBx": "N/A",
                "PstCd": "3000",
                "Room": "N/A",
                "StrtNm": "Main St",
                "TwnNm": "Springfield"
            }
        },
        // Additional sample data items
        { "Unstructured": { "address": "456 Elm St" }, "Structured": {} },
        {
            "Unstructured": { "address": "789 Oak Ave" }, "Structured": {
                "Address": "789 Oak Ave",
                "BldgNb": "789",
                "Ctry": "GB",
                "CtrySubDvsn": "ENG",
                "Dept": "Marketing",
                "Flr": "3rd",
                "Name": "Jane Smith",
                "PstBx": "N/A",
                "PstCd": "E1 6AN",
                "Room": "305",
                "StrtNm": "Oak Ave",
                "TwnNm": "London"
            }
        },
        {
            "Unstructured": { "address": "321 Pine Rd" }, "Structured": {
                "Address": "321 Pine Rd",
                "BldgNb": "321",
                "Ctry": "CA",
                "CtrySubDvsn": "ON",
                "Dept": "HR",
                "Flr": "1st",
                "Name": "Emily Davis",
                "PstBx": "N/A",
                "PstCd": "K1A 0B1",
                "Room": "102",
                "StrtNm": "Pine Rd",
                "TwnNm": "Toronto"
            }
        },
        // Add 15 more sample items
        ...Array.from({ length: 15 }, (_, index) => ({
            "Unstructured": { "address": `Address ${index + 4}` },
            "Structured": {
                "Address": `Address ${index + 4}`,
                "BldgNb": `${index + 4}`,
                "Ctry": "US",
                "CtrySubDvsn": "State",
                "Dept": "Department",
                "Flr": "Floor",
                "Name": `Name ${index + 4}`,
                "PstBx": "P.O. Box",
                "PstCd": `ZIP${index + 4}`,
                "Room": `${index + 4}`,
                "StrtNm": `Street ${index + 4}`,
                "TwnNm": `Town ${index + 4}`
            }
        }))
    ];

    // Pagination logic
    const totalPages = Math.ceil(sampleData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sampleData.slice(indexOfFirstItem, indexOfLastItem);

    // Handle cell click
    const handleCellClick = (unstructuredValue, structuredValue) => {
        setSelectedCellValue(unstructuredValue);
        setCorrespondingValue(structuredValue);
    };

    // Handle button click
    const handleButtonClick = () => {
        if (correspondingValue && Object.values(correspondingValue).some(value => value !== "" && value !== "N/A")) {
            toast.success("Already Structured");
        } else {
            console.log('Selected Cell Value:', selectedCellValue);
            console.log('Corresponding Value:', correspondingValue);
            toast.info("Structuring Existing data");
        }
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="d-flex my-2">
                <Button type="button" variant="outline-dark" onClick={handleButtonClick}>
                    Convert to Structured Address
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
                                        onClick={() => handleCellClick(item.Unstructured.address, item.Structured)}
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
