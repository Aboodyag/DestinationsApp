const express = require('express');
const { register, login } = require('./authControllers');
const router = express.Router();

// Routes
router.post('/register', register); // Calls the register function
router.post('/login', login); // Calls the login function



module.exports = router;
