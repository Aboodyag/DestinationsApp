const express = require('express');
const router = express.Router();
const verifyToken = require('./verifyToken.js');
const Users = require('../Schemas/user');

// Fetch all users for the admin panel
router.get('/users', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const users = await Users.find({}, 'name email isAdmin').lean();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

module.exports = router;