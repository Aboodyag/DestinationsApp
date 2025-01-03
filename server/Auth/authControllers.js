const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../Schemas/user');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

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
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user in the database
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate the password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send the token and admin status
        res.status(200).json({ token, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

module.exports = { login, register };

