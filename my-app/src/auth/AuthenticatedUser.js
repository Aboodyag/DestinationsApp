import React, { useState, useEffect } from 'react';
import './AuthenticatedUser.css';
import Footer from './Footer';



const AuthenticatedUser = ({ isAdmin }) => {
    const [userType, setUserType] = useState(isAdmin ? 'Admin' : 'User');
    const [searchResults, setSearchResults] = useState([]);
    const [publicLists, setPublicLists] = useState([]);
    const [privateLists, setPrivateLists] = useState([]); // ** Fetch and display private lists
    const [expandedDetails, setExpandedDetails] = useState({});
    const [expandedLists, setExpandedLists] = useState({});
    const [lists, setLists] = useState([]);
    const [newList, setNewList] = useState({ name: '', description: '', destinations: [], isPublic: false });
    const [adminMessage, setAdminMessage] = useState(''); // ** Display admin panel messages
    const [userId, setUserId] = useState(''); // ** Manage user actions in admin panel
    const [users, setUsers] = useState([]); // ** List of users for dropdown
    const [selectedUser, setSelectedUser] = useState(''); // ** Selected user from dropdown
    const [reviewId, setReviewId] = useState(''); // ** Manage reviews in admin panel

    const [editList, setEditList] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // To track if the modal is open


    const fetchReviews = async (listId) => {
        try {
            const response = await fetch(`/api/auth/get-reviews/${listId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setExpandedLists((prev) => ({
                ...prev,
                [listId]: { ...prev[listId], reviews: data },
            }));
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };


    const handleOpenEditModal = (list) => {
        setEditList(list); // Set the selected list
        setIsEditModalOpen(true); // Open the modal
    };
    const handleEditList = async (updatedList) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/auth/edit-list/${updatedList._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedList),
            });

            if (!response.ok) {
                throw new Error('Failed to edit list');
            }

            const data = await response.json();

            // Update state
            setPrivateLists((prevLists) =>
                prevLists.map((list) =>
                    list._id === updatedList._id ? data.list : list
                )
            );

            setIsEditModalOpen(false); // Close the modal
            setEditList(null);

            alert('List updated successfully!');
        } catch (error) {
            console.error('Error editing list:', error);
            alert('Failed to edit list.');
        }
    };


    const handleDeleteList = async (listId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not logged in.');
            }

            const response = await fetch(`/api/auth/delete-list/${listId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete list');
            }

            setPrivateLists((prevLists) => prevLists.filter((list) => list._id !== listId));
            alert('List deleted successfully');
        } catch (error) {
            console.error('Error deleting list:', error);
            alert('Failed to delete list');
        }
    };

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

    const toggleListDetails = async (listId) => {
        setExpandedLists((prev) => ({
            ...prev,
            [listId]: !prev[listId],
        }));
    
        if (!expandedLists[listId]) {
            try {
                const response = await fetch(`/api/auth/reviews/${listId}`);
                if (response.ok) {
                    const reviews = await response.json();
                    setPublicLists((prevLists) =>
                        prevLists.map((list) =>
                            list._id === listId ? { ...list, reviews } : list
                        )
                    );
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        }
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
            if (!token) {
                throw new Error('No token found. Please log in.');
            }

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

    const handleAddDestination = () => {
        setNewList((prevList) => ({
            ...prevList,
            destinations: [...prevList.destinations, { name: '', location: '', details: '' }],
        }));
    };

    const handleDestinationChange = (index, field, value) => {
        setNewList((prevList) => {
            const updatedDestinations = [...prevList.destinations];
            updatedDestinations[index][field] = value;
            return { ...prevList, destinations: updatedDestinations };
        });
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('User not logged in.');

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

            const data = await response.json();
            alert('List created successfully!');
            console.log('Created list:', data);
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };


    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in.');
            }
            const response = await fetch('/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    const grantManager = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in.");
            }

            if (!selectedUser) {
                alert("Please select a user.");
                return;
            }

            const response = await fetch(`/api/admin/grant-manager/${selectedUser}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            setAdminMessage(data.message || "User granted admin privileges successfully.");
        } catch (error) {
            console.error("Error granting admin privileges:", error);
            setAdminMessage("Error granting admin privileges: " + error.message);
        }
    };

    const toggleReviewVisibility = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/review/${reviewId}/toggle-hidden`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setAdminMessage(data.message || 'Operation successful');
        } catch (error) {
            setAdminMessage('Failed to toggle review visibility.');
        }
    };

    // const toggleUserStatus = async () => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         const response = await fetch(`/api/admin/user/${selectedUser}/toggle-disabled`, {
    //             method: 'PATCH',
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         const data = await response.json();
    //         setAdminMessage(data.message || 'Operation successful');
    //     } catch (error) {
    //         setAdminMessage('Failed to toggle user status.');
    //     }
    // };

    // Function to toggle user status
    const toggleUserStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found. Please log in.');
            }

            if (!selectedUser) {
                throw new Error('No user selected.');
            }

            const response = await fetch(`/api/admin/toggle-user-status/${selectedUser}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to toggle user status: ${response.statusText}`);
            }

            const data = await response.json();
            setAdminMessage(data.message || 'Operation successful');
        } catch (error) {
            console.error('Error toggling user status:', error);
            setAdminMessage(error.message);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchUsers();
    }, [isAdmin]);


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

            {isAdmin && (
                <section className="admin-panel">
                    <h2>Admin Panel</h2>
                    <div>
                        <h3>Grant Manager Privileges</h3>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name || user.email}
                                </option>
                            ))}
                        </select>
                        <button onClick={grantManager}>Grant Privileges</button>
                    </div>

                    <div>
                        <h3>Toggle Review Visibility</h3>
                        <input
                            type="text"
                            placeholder="Review ID"
                            value={reviewId}
                            onChange={(e) => setReviewId(e.target.value)}
                        />
                        <button onClick={toggleReviewVisibility}>Toggle Visibility</button>
                    </div>

                    <div>
                        <h3>Toggle User Status</h3>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name || user.email}
                                </option>
                            ))}
                        </select>
                        <button onClick={toggleUserStatus}>Toggle Status</button>
                    </div>
                    {adminMessage && <p>{adminMessage}</p>}
                </section>
            )}


            {/* Search Section */}
            <div class="search-section">
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
            <p><strong>Description:</strong> {list.description || 'No description provided'}</p>
            <p><strong>Average Rating:</strong> {list.avgRating ? list.avgRating.toFixed(1) : 'Not rated yet'}</p>
            {expandedLists[list._id] && (
                <div>
                    <h4>Destinations:</h4>
                    <ul>
                        {list.destinations.map((destination, index) => (
                            <li key={destination._id || index}>
                                <strong>Name:</strong> {destination.name || 'Unnamed'} <br />
                                <strong>Location:</strong> {destination.location || 'Unknown'} <br />
                                <strong>Details:</strong> {destination.details || 'No details provided'}
                            </li>
                        ))}
                    </ul>
                    <h4>Reviews:</h4>
                    {list.reviews && list.reviews.length > 0 ? (
                        list.reviews.map((review) => (
                            <div key={review._id}>
                                <p><strong>User:</strong> {review.userId?.name || 'Unknown'}</p>
                                <p><strong>Rating:</strong> {review.rating}</p>
                                <p><strong>Comment:</strong> {review.comment || 'No comment'}</p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet.</p>
                    )}
                    <ReviewForm listId={list._id} onAddReview={handleAddReview} />
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
                                        <li key={destination._id || index}>
                                            <strong>Name:</strong> {destination.name || 'Unnamed'} <br />
                                            <strong>Location:</strong> {destination.location || 'Unknown'} <br />
                                            <strong>Details:</strong> {destination.details || 'No details provided'}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => handleOpenEditModal(list)}>Edit List</button>
                                <button onClick={() => handleDeleteList(list._id)}>Delete List</button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Edit Modal */}
                {isEditModalOpen && editList && (
                    <EditListModal
                        list={editList}
                        onSave={handleEditList}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}


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
                    <h3>Destinations</h3>
                    {newList.destinations.map((destination, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                placeholder="Destination Name"
                                value={destination.name}
                                onChange={(e) => handleDestinationChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={destination.location}
                                onChange={(e) => handleDestinationChange(index, 'location', e.target.value)}
                            />
                            <textarea
                                placeholder="Details"
                                value={destination.details}
                                onChange={(e) => handleDestinationChange(index, 'details', e.target.value)}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddDestination}>
                        Add Destination
                    </button>
                    <button type="submit">Create List</button>
                </form>
            </section>
            <Footer />
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

const EditListModal = ({ list, onSave, onClose }) => {
    const [name, setName] = useState(list.name || '');
    const [description, setDescription] = useState(list.description || '');
    const [destinations, setDestinations] = useState(list.destinations || []);
    const [isPublic, setIsPublic] = useState(list.isPublic || false);

    const handleDestinationChange = (index, field, value) => {
        const updatedDestinations = [...destinations];
        updatedDestinations[index][field] = value;
        setDestinations(updatedDestinations);
    };

    const handleSave = () => {
        const updatedList = {
            ...list,
            name,
            description,
            destinations,
            isPublic,
        };
        onSave(updatedList);
    };

    return (
        <div className="edit-modal">
            <h3>Edit List</h3>
            <label>
                Name:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label>
                Description:
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>
            <label>
                Destinations:
                <ul>
                    {destinations.map((destination, index) => (
                        <li key={index}>
                            <input
                                type="text"
                                placeholder="Name"
                                value={destination.name || ''}
                                onChange={(e) =>
                                    handleDestinationChange(index, 'name', e.target.value)
                                }
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                value={destination.location || ''}
                                onChange={(e) =>
                                    handleDestinationChange(index, 'location', e.target.value)
                                }
                            />
                            <input
                                type="text"
                                placeholder="Details"
                                value={destination.details || ''}
                                onChange={(e) =>
                                    handleDestinationChange(index, 'details', e.target.value)
                                }
                            />
                        </li>
                    ))}
                </ul>
            </label>
            <label>
                Public:
                <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                />
            </label>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

const handleAddReview = async (listId, rating, comment) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not logged in.');

        const response = await fetch(`/api/auth/add-review/${listId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, comment }),
        });

        if (!response.ok) throw new Error('Failed to add review');

        alert('Review added successfully!');
    } catch (error) {
        console.error('Error adding review:', error.message);
        alert('Failed to add review.');
    }
};



const ReviewForm = ({ listId, onAddReview }) => {
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddReview(listId, rating, comment);
        setRating(1);
        setComment('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Rating:
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </label>
            <textarea
                placeholder="Optional comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">Add Review</button>
        </form>
    );
};


export default AuthenticatedUser;
