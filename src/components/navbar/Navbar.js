import React from 'react';
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUserCircle, FaRegUser } from "react-icons/fa";
import logo from "../Assets/hackfestLogo.png";
import { CiPower } from "react-icons/ci";
import { useHistory } from 'react-router-dom'; 

export default function Navbar(props) {

    const history = useHistory();

    const switchTooltip = (
        <Tooltip id="switch-tooltip">
            {props.mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </Tooltip>
    );

    const logoutIcon =(
            <Tooltip id="switch-tooltip">
            {props.mode === 'light' ? 'Log Out' : 'Log Out'}
        </Tooltip>
    );

    const iconColor = props.mode === 'light' ? '#000000' : '#ffffff';

    const logOut =  () => {
        history.push('/login');
        console.log("logged Out")
    };


    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-${props.mode} bg-${props.mode}`}>
                <div className='container-fluid'>
                    <a href="#" className="logo">
                        <img src={logo} alt="Logo" className="logo-img" style={{ width: "80px", height: "50px" }} />
                    </a>

                    <a className="navbar-brand" href="#">{props.title}</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">

                        </ul>
                        <div className="d-inline-flex align-items-center">
                            {props.mode === 'light' ? <FaUserCircle size={30} style={{ color: iconColor, marginRight: '5px' }} /> : <FaRegUser size={30} style={{ color: iconColor, marginRight: '5px' }} />}
                            <span style={{ color: iconColor }}>Welcome {props.username}</span>
                        </div>
                    </div>

                    <div className="mx-3">
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 100 }}
                            overlay={logoutIcon}
                        >
                            <div className="d-inline-block" onClick={logOut} >
                                {props.mode === 'light' ? <CiPower size={30} /> : <CiPower size={30} color="#ffffff" />}
                            </div>
                        </OverlayTrigger>
                    </div>

                    <div className="mx-3">
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 100 }}
                            overlay={switchTooltip}
                        >
                            <div className="d-inline-block" onClick={props.toggleMode}>
                                {props.mode === 'light' ? <MdLightMode size={30} /> : <MdDarkMode size={30} color="#ffffff" />}
                            </div>
                        </OverlayTrigger>
                    </div>

                </div>
            </nav>
        </>
    );
}
