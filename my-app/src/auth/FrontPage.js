import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import './FrontPage.css';
import Footer from './Footer';

const FrontPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [expandedDetails, setExpandedDetails] = useState({}); // For destinations
    const [expandedLists, setExpandedLists] = useState({}); // For lists

    const handleLoginSuccess = (token, isAdmin) => {
        setUser({ token, isAdmin });
        window.location.href = '/'; // Redirect to login

    };

    const handleSearch = async (filters) => {
        try {
            // Trim and validate filters to avoid unnecessary or empty parameters

            const trimmedFilters = {};
            for (const key in filters) {
                if (filters[key].trim() !== '') {
                    trimmedFilters[key] = filters[key].trim();
                }
            }
        // If all inputs are empty return early and do not perform a fetch

            if (Object.keys(trimmedFilters).length === 0) {
                setSearchResults([]);
                return;
            }
            // Create query parameters from the filters

            const queryParams = new URLSearchParams(trimmedFilters).toString();
            // Send request to the search endpoint using a relative URL

            const response = await fetch(`/api/destination/search?${queryParams}`);

            // Check for response success

            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error during search:', error);
            setSearchResults([]);
        }
    };

    const toggleDetails = (id) => {
        setExpandedDetails((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggleListDetails = (id) => {
        setExpandedLists((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const fetchPublicLists = async () => {
        try {
            const response = await fetch('/api/auth/public-lists');
            if (!response.ok) {
                throw new Error('Failed to fetch public lists');
            }

            const data = await response.json();
            setPublicLists(data);
        } catch (error) {
            console.error('Error fetching public lists:', error);
        }
    };

    useEffect(() => {
        fetchPublicLists();
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Welcome to the Destination Application</h1>
            <p>Register or log in to access your personalized dashboard, or explore destinations below.</p>
            <div>
                <button onClick={() => setIsLogin(true)} style={{ marginRight: '10px', color: 'blue' }}>
                    Login
                </button>
                <button onClick={() => setIsLogin(false)} style={{ color: 'blue' }}>
                    Register
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                {isLogin ? <Login onLoginSuccess={handleLoginSuccess} /> : <Register />}
            </div>

            {/* Search Section */}
            <div>
                <h2>Search Destinations</h2>
                <SearchForm onSearch={handleSearch} />
                <div className="search-results">
                    {searchResults.map((result) => (
                        <div className="search-result-card" key={result._id}>
                            <h3>{result.Destination}, {result.Country}</h3>
                            <p><strong>Region:</strong> {result.Region}</p>
                            {expandedDetails[result._id] && (
                                <>
                                    <p><strong>Category:</strong> {result.Category}</p>
                                    <p><strong>Latitude:</strong> {result.Latitude}</p>
                                    <p><strong>Longitude:</strong> {result.Longitude}</p>
                                    <p><strong>Annual Tourists:</strong> {result['Approximate Annual Tourists']}</p>
                                    <p><strong>Description:</strong> {result.Description}</p>
                                </>
                            )}
                            <button onClick={() => toggleDetails(result._id)}>
                                {expandedDetails[result._id] ? 'View Less' : 'View More'}
                            </button>
                            <button
                                onClick={() =>
                                    window.open(`https://duckduckgo.com/?q=${result.Destination}`, '_blank')
                                }
                            >
                                Search on DuckDuckGo
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Public Lists Section */}
            <h2>Public Lists</h2>
            <div className="public-lists">
                {publicLists.map((list) => (
                    <div className="public-list-card" key={list._id}>
                        <h3>{list.name}</h3>
                        <p><strong>Created by:</strong> {list.listOwner?.name || 'Unknown'}</p>
                        <p><strong>Destinations:</strong> {list.destinations.length}</p>
                        <p><strong>Description:</strong> {list.description || 'No description provided'}</p>
                        {expandedLists[list._id] && (
    <div>
        <h4>Destinations:</h4>
        <ul>
            {list.destinations.map((destination) => (
                <li key={destination._id}> {/* Use _id from destination as a unique key */}
                    <strong>{destination.destinationName}</strong> <br />
                    Latitude: {destination.latitude}, Longitude: {destination.longitude}
                </li>
            ))}
        </ul>
    </div>
)}
                        <button onClick={() => toggleListDetails(list._id)}>
                            {expandedLists[list._id] ? 'View Less' : 'View More'}
                        </button>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

// A basic SearchForm component
const SearchForm = ({ onSearch }) => {
    const [filters, setFilters] = useState({ Name: '', Region: '', Country: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Destination Name"
                value={filters.Name}
                onChange={(e) => setFilters({ ...filters, Name: e.target.value })}
            />
            <input
                type="text"
                placeholder="Region"
                value={filters.Region}
                onChange={(e) => setFilters({ ...filters, Region: e.target.value })}
            />
            <input
                type="text"
                placeholder="Country"
                value={filters.Country}
                onChange={(e) => setFilters({ ...filters, Country: e.target.value })}
            />
            <button type="submit">Search</button>
        </form>
        
    );
};

export default FrontPage;
