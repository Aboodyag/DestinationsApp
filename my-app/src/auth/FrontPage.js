import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const FrontPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (token, isAdmin) => {
        setUser({ token, isAdmin });
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Welcome to Our Application</h1>
            <p>Register or log in to access your personalized dashboard.</p>
            <div>
                <button onClick={() => setIsLogin(true)} style={{ marginRight: '10px' }}>
                    Login
                </button>
                <button onClick={() => setIsLogin(false)}>Register</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                {isLogin ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <Register />
                )}
            </div>
            {user && (
                <div style={{ marginTop: '20px' }}>
                    <p>Logged in as: {user.isAdmin ? 'Admin' : 'User'}</p>
                </div>
            )}
        </div>
    );
};

export default FrontPage;
