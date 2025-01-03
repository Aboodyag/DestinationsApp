const express = require("express");
require('dotenv').config();
const app = express()
const dbConnect = require('./config/dbConnect')
const cors = require('cors');



//Connect to the database
dbConnect();

//middleware
app.use(express.json());
app.use(cors());

//Routes
const authRoute = require('./Auth/authRoutes');
app.use('/api/auth', authRoute);




//Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

