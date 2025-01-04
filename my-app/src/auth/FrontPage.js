import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';

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

            {/* Search Section */}
            <div style={{ marginTop: '40px' }}>
                <h2>Search Destinations</h2>
                <SearchForm onSearch={handleSearch} />
                <div>
                    {searchResults.map((result, index) => (
                        <div key={index}>
                            <h3>{result.destination}, {result.country}</h3>
                            <button onClick={() => window.open(`https://duckduckgo.com/?q=${result.destination}`, '_blank')}>
                                Search on DuckDuckGo
                            </button>
                            <p>{JSON.stringify(result)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Public Lists Section */}
            <div style={{ marginTop: '40px' }}>
                <h2>Public Destination Lists</h2>
                {publicLists.map((list, index) => (
                    <div key={index}>
                        <h3>{list.name} (by {list.creatorNickname})</h3>
                        <p>Destinations: {list.destinations.length}</p>
                        <p>Average Rating: {list.averageRating}</p>
                        <p>Last Modified: {new Date(list.lastModified).toLocaleDateString()}</p>
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
