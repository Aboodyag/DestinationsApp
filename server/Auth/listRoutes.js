const express = require('express');
const router = express.Router();
const List = require('./Schemas/list');

// Fetch public lists
router.get('/public-lists', async (req, res) => {
    try {
        const publicLists = await List.find({ isPublic: true })
            .populate('listOwner', 'name') // Populate owner details (if needed)
            .sort({ lastModified: -1 }) // Sort by last modified date (newest first)
            .limit(10); // Limit to 10 results

        res.status(200).json(publicLists);
    } catch (error) {
        console.error('Error fetching public lists:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
