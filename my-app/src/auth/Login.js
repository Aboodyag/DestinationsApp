import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();


            // add else ifs staements to check for status if account is not verified or if account is deactivated + add else for other errors
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Account not verified. Please verify your email.');
                } else if (response.status === 403) {
                    throw new Error('Account is deactivated. Contact support.');
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            }
                
            // Save the token and admin status in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAdmin', data.isAdmin);

            // Notify parent component
            onLoginSuccess(data.token, data.isAdmin);
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
