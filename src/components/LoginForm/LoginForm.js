import React, { useState } from 'react';
import './LoginForm.css';
import { FaUserEdit } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { useHistory } from 'react-router-dom'; 
import axios from 'axios';

const LoginForm = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const history = useHistory(); // Initialize useHistory hook


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            const response = await axios.get(`https://asia-south1-apt-terrain-351005.cloudfunctions.net/LoginFunction`, {
                params: {
                    username: username,
                    password: password
                }
            });

        console.log(response.data);

            if (response.status === 200) {
                setIsLoggedIn(true);
                history.push('/upload', { username });
            } else {
                setErrorMessage('Username or password is incorrect');
            }
        } catch (error) {
            setErrorMessage('An error occurred: ' + (error.response?.data?.message || error.message));
        }
    };


    return (
        <div className='wrapper'>
            <form onSubmit={handleFormSubmit}>
                <h1>Login</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Username"
                        required
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FaUserEdit className="icon" />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FaLock className="icon" />
                </div>
                <div className="remember-forgot">
                    <label>
                        <input type="checkbox" />Remember me
                    </label>
                    <a href="#">Forgot password?</a>
                </div>
                <button type="submit">Login</button>
                <div className="register-link">
                    <p>Don't have an account?  <a href="#">Register</a></p>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;

