import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FrontPage from './auth/FrontPage';
import AuthenticatedUser from './auth/AuthenticatedUser';

const App = () => {
    const isLoggedIn = !!localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoggedIn ? (
                            isAdmin ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <Navigate to="/authenticated" replace />
                            )
                        ) : (
                            <FrontPage />
                        )
                    }
                />
                <Route
                    path="/authenticated"
                    element={
                        isLoggedIn ? (
                            <AuthenticatedUser isAdmin={false} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route
                    path="/admin"
                    element={
                        isLoggedIn && isAdmin ? (
                            <AuthenticatedUser isAdmin={true} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
