import React, { useEffect, useState } from 'react';
import FileUpload from '../uploadFile/FileUpload';
import { useLocation } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import SearchAdd from '../SearchAdd/SearchAdd';
import './Home.css'; // Ensure this CSS file exists
import AddressValidator from '../AddressValidator/AddressValidator';

function Home() {
    const location = useLocation();
    const username = location.state && location.state.username;
    const [mode, setMode] = useState("light");
    const [activeComponent, setActiveComponent] = useState(null); // State to determine which component is active

    const toggleMode = () => {
        if (mode === "light") {
            setMode("dark");
            document.body.style.background = "#042743";
        } else {
            setMode("light");
            document.body.style.background = "white";
        }
    };

    const handleFileUploadClick = () => {
        setActiveComponent('fileUpload');
    };

    const handleSearchAddClick = () => {
        setActiveComponent('searchAdd');
    };

    const handleAddresValidator = () => {
        setActiveComponent('addressValidator');
    };

    const handleReset = () => {
        setActiveComponent(null); // Reset to show both components
    };

    return (
        <div className="home-container">
            <Navbar
                title="HackFest 2024 - ADDAI (app) "
                mode={mode}
                toggleMode={toggleMode}
                username={username}
            />

            {!activeComponent && (
                <div className="buttons-container">
                    <button className="showComponent" onClick={handleFileUploadClick}>
                        Show File Upload
                    </button>
                    <button className="showComponent" onClick={handleSearchAddClick}>
                        Search Address via GeoCoding
                    </button>
                    <button className="showComponent" onClick={handleAddresValidator}>
                        Address Validator
                    </button>
                </div>
            )}

            {activeComponent && (
                <div className="components-container">
                    {activeComponent === 'fileUpload' && <FileUpload />}
                    {activeComponent === 'searchAdd' && <SearchAdd  />}
                    {activeComponent === 'addressValidator' && <AddressValidator />}
                </div>
            )}

            {activeComponent && (
                <button type="button" className ="btn btn-outline-info" style ={{marginTop: "10px"}} onClick={handleReset}>
                    View Home 
                </button>
            )}
        </div>
    );
}

export default Home;
