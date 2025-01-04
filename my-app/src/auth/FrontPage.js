import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import './FrontPage.css';

const FrontPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [publicLists, setPublicLists] = useState([]);

    const handleLoginSuccess = (token, isAdmin) => {
        setUser({ token, isAdmin });
    };

    const handleSearch = async (filters) => {
        try {
            // Trim and validate filters to avoid unnecessary or empty parameters
            const trimmedFilters = {};
            for (const key in filters) {
                if (filters[key].trim() !== "") {
                    trimmedFilters[key] = filters[key].trim();
                }
            }
    
            // Create query parameters from the filters
            const queryParams = new URLSearchParams(trimmedFilters).toString();
    
            // Send request to the search endpoint using a relative URL
            const response = await fetch(`/api/destination/search?${queryParams}`);
    
            // Check for response success
            if (!response.ok) {
                throw new Error("Failed to fetch search results");
            }
    
            // Parse and validate the response data
            const data = await response.json();
    
            if (Array.isArray(data)) {
                setSearchResults(data); // Update state with search results
            } else {
                console.error("API returned non-array data:", data);
                setSearchResults([]); // Reset search results if invalid data
            }
        } catch (error) {
            console.error("Error during search:", error);
            setSearchResults([]); // Reset search results on error
        }
    };


    // const fetchPublicLists = async () => {
    //     const response = await fetch('/api/destination-lists/public');
    //     const data = await response.json();
    //     setPublicLists(data);
    // };

    // useEffect(() => {
    //     fetchPublicLists();
    // }, []);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Welcome to the destination Application</h1>
            <p>Register or log in to access your personalized dashboard, or explore destinations below.</p>
            <div>
                <button onClick={() => setIsLogin(true)} style={{ marginRight: '10px', color: 'blue'}}>
                    Login
                </button>
                <button onClick={() => setIsLogin(false)} style={{color: 'blue'}}>
                    Register
                    </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                {isLogin ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                    <Register />
                )}
            </div>

            {/* Search Section */}
            <div>
        <h2>Search Destinations</h2>
        <SearchForm onSearch={handleSearch} />
        <div className="search-results">
            {searchResults.map((result, index) => (
                <div className="search-result-card" key={index}>
                    <h3>{result.Destination}, {result.Country}</h3>
                    <p><strong>Region:</strong> {result.Region}</p>
                    <p><strong>Description:</strong> {result.Description}</p>
                    <button onClick={() => window.open(`https://duckduckgo.com/?q=${result.Destination}`, '_blank')}>
                        Search on DuckDuckGo
                    </button>
                </div>
            ))}
        </div>
    </div>

    {/* Public Lists Section */}
    <div className="public-lists">
        {publicLists.map((list, index) => (
            <div className="public-list-card" key={index}>
                <h3>{list.name}</h3>
                <p><strong>Created by:</strong> {list.creatorNickname}</p>
                <p><strong>Destinations:</strong> {list.destinations.length}</p>
                <p><strong>Average Rating:</strong> {list.averageRating}</p>
                <button onClick={() => alert(JSON.stringify(list))}>
                    View List Details
                </button>
            </div>
        ))}
    </div>
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
