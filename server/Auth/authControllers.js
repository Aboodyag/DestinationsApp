const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../Schemas/user');

const JWT_SECRET = process.env.JWT_SECRET || 'abdul';

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({
            email,
            passwordHash: hashedPassword,
            name,
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({ message: 'Email not verified. Please verify your email.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, isAdmin: user.isAdmin });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { login, register };