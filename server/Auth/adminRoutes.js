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

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

// Grant admin privileges to a user
router.patch("/grant-manager/:id", verifyToken, async (req, res) => {
    try {
        // Ensure the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        const userId = req.params.id;

        console.log("Granting admin to user ID:", userId); // Debugging log

        // Update the user's isAdmin status
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { isAdmin: true },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: `User ${updatedUser.email} is now an admin.` });
    } catch (error) {
        console.error("Error granting admin privileges:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Toggle User Active Status
router.patch('/toggle-user-status/:id', verifyToken, async (req, res) => {
    try {
        // Ensure the requester is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const userId = req.params.id;

        // Find the user and toggle the isActive status
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            message: `User status updated successfully. User is now ${user.isActive ? 'active' : 'disabled'}.`,
            user,
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ message: 'Failed to update user status.', error: error.message });
    }
});

module.exports = router;