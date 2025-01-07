import React, { useState, useEffect } from 'react';
//import './AuthenticatedUser.css';

const AuthenticatedUser = ({ isAdmin }) => {
    const [userType, setUserType] = useState(isAdmin ? 'Admin' : 'User');
    const [searchResults, setSearchResults] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [privateLists, setPrivateLists] = useState([]); // ** Fetch and display private lists
    const [expandedDetails, setExpandedDetails] = useState({});
    const [expandedLists, setExpandedLists] = useState({});
    const [lists, setLists] = useState([]);
    const [newList, setNewList] = useState({ name: '', description: '', destinations: [], isPublic: false });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        window.location.href = '/'; // Redirect to FrontPage
    };

    const handleSearch = async (filters) => {
        try {
            const trimmedFilters = {};
            for (const key in filters) {
                if (filters[key].trim() !== '') {
                    trimmedFilters[key] = filters[key].trim();
                }
            }

            if (Object.keys(trimmedFilters).length === 0) {
                setSearchResults([]);
                return;
            }

            const queryParams = new URLSearchParams(trimmedFilters).toString();
            const response = await fetch(`/api/destination/search?${queryParams}`);

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

    const fetchPrivateLists = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/private-lists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch private lists');
            }
            const data = await response.json();
            setPrivateLists(data);
        } catch (error) {
            console.error('Error fetching private lists:', error);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/create-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newList),
            });
            if (!response.ok) {
                throw new Error('Failed to create list');
            }
            setNewList({ name: '', description: '', destinations: [], isPublic: false });
            fetchPrivateLists(); // Refresh private lists
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    useEffect(() => {
        fetchPublicLists();
        fetchPrivateLists();
    }, []);

    return (
        <div className="authenticated-user">
            <header>
                <h1>Welcome, {userType}</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

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
                                    {list.destinations.map((destination, index) => (
                                        <li key={index}>{destination}</li>
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

            {/* Private Lists Section */}
            <h2>Your Private Lists</h2>
            <div className="private-lists">
                {privateLists.map((list) => (
                    <div className="private-list-card" key={list._id}>
                        <h3>{list.name}</h3>
                        <p><strong>Description:</strong> {list.description || 'No description provided'}</p>
                        <p><strong>Last Modified:</strong> {new Date(list.lastModified).toLocaleString()}</p>
                        <button onClick={() => toggleListDetails(list._id)}>
                            {expandedLists[list._id] ? 'View Less' : 'View More'}
                        </button>
                        {expandedLists[list._id] && (
                            <div>
                                <h4>Destinations:</h4>
                                <ul>
                                    {list.destinations.map((destination, index) => (
                                        <li key={index}>{destination}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create List Section */}
            <section>
                <h2>Create a New List</h2>
                <form onSubmit={handleCreateList}>
                    <input
                        type="text"
                        placeholder="List Name"
                        value={newList.name}
                        onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newList.description}
                        onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={newList.isPublic}
                            onChange={(e) => setNewList({ ...newList, isPublic: e.target.checked })}
                        />
                        Public
                    </label>
                    <button type="submit">Create List</button>
                </form>
            </section>
        </div>
    );
};

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

export default AuthenticatedUser;
