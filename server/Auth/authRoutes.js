const express = require('express');
const { register, login } = require('./authControllers');
const router = express.Router();
const authToken = require('./verifyToken.js');
const List = require('../Schemas/list');
const Review = require('../Schemas/review');
const Users = require('../Schemas/user');




// Routes
router.post('/register', register); // Calls the register function
router.post('/login', login); // Calls the login function


// Fetch public lists
router.get('/public-lists', async (req, res) => {
    try {
        const publicLists = await List.find({ isPublic: true })
            .populate('listOwner', 'name') 
            .sort({ lastModified: -1 }) 
            .limit(10); 
        res.status(200).json(publicLists);
    } catch (error) {
        console.error('Error fetching public lists:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch private lists for authenticated users
router.get('/private-lists', authToken, async (req, res) => {
    try {
        // Debug log to check the user object
        console.log('User in /private-lists:', req.user);

        // Ensure user ID exists in the token
        if (!req.user?.id) {
            return res.status(403).json({ message: 'Forbidden. Invalid user token.' });
        }

        const privateLists = await List.find({ listOwner: req.user.id, isPublic: false }).sort({ lastModified: -1 });
        res.status(200).json(privateLists);
    } catch (error) {
        console.error('Error fetching private lists:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Fetch user-specific lists
router.get('/lists', authToken, async (req, res) => {
    try {
        const userLists = await List.find({ listOwner: req.user.id });
        res.status(200).json(userLists);
    } catch (error) {
        console.error('Error fetching user lists:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new list
router.post('/create-list', authToken, async (req, res) => {
    try {
        const { name, description, destinations, isPublic } = req.body;
        if (!name || !destinations || destinations.length === 0) {
            return res.status(400).json({ message: 'List name and destinations are required' });
        }
        const newList = new List({
            name,
            description,
            destinations,
            isPublic,
            listOwner: req.user.id,
        });
        await newList.save();
        res.status(201).json({ message: 'List created successfully' });
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit an existing list
router.put('/edit-list/:id', authToken, async (req, res) => {
    try {
        const { name, description, destinations, isPublic } = req.body;
        const list = await List.findById(req.params.id);

        if (!list || list.listOwner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to edit this list' });
        }

        list.name = name || list.name;
        list.description = description || list.description;
        list.destinations = destinations || list.destinations;
        list.isPublic = typeof isPublic !== 'undefined' ? isPublic : list.isPublic;

        await list.save();
        res.status(200).json({ message: 'List updated successfully', list });
    } catch (error) {
        console.error('Error editing list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a list
router.delete('/delete-list/:id', authToken, async (req, res) => {
    try {
        const list = await List.findById(req.params.id);

        if (!list || list.listOwner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this list' });
        }

        await List.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a review to a public list
router.post('/add-review/:listId', authToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        const list = await List.findById(req.params.listId);
        if (!list || !list.isPublic) {
            return res.status(404).json({ message: 'Public list not found' });
        }

        const newReview = new Review({
            listName: list.name,
            rating,
            comment,
            userName: req.user.name,
        });

        await newReview.save();
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch reviews for a list
router.get('/reviews/:listId', async (req, res) => {
    try {
        const list = await List.findById(req.params.listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const reviews = await Review.find({ listName: list.name, isVisible: true })
            .sort({ creationDate: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
