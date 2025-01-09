const express = require("express");
require('dotenv').config();
const app = express()
const {dbConnect, client} = require('./config/dbConnect')
const cors = require('cors');
const User = require('./Schemas/user'); 


app.use(express.json());
app.use(express.json({ limit: "50kb" }));
//Connect to the database
dbConnect();

//middleware
app.use(express.json());
app.use(cors());

//Routes
const authRoute = require('./Auth/authRoutes');
app.use('/api/auth', authRoute);

const adminRoute = require('./Auth/adminRoutes');
const { default: mongoose } = require("mongoose");
app.use('/api/admin', adminRoute);

// const listRoute = require('./Auth/listRoutes'); 
// app.use('/api/list', listRoute);
//----------------------this crashes the server---------------------


//DESTINATION SEARCH

const destinationCollection = client.db('Destinations').collection('destinations');

// app.get('/api/test-destinations', async (req, res) => {
//     try {
//         const destinations = await destinationCollection.find({}).limit(5).toArray();
//         res.json(destinations);
//     } catch (error) {
//         console.error('Error fetching destinations:', error);
//         res.status(500).json({ error: 'Failed to fetch destinations' });
//     }
// });


// app.get('/api/destination/search', (req, res, next) => {
//     console.log("Request Headers:", req.headers); // Log headers
//     next();
// });



app.get("/api/destination/search", async (req, res) => {
    try {
        const normalizeString = (str) =>
            str.trim().toLowerCase().replace(/\s+/g, ""); // Normalize input (trim, lowercase, remove extra spaces)

        const query = {};
        if (req.query.Name) {
            const normalizedName = normalizeString(req.query.Name);
            query.Destination = { $regex: new RegExp(normalizedName, "i") }; // Soft-match with regex
        }
        if (req.query.Region) {
            const normalizedRegion = normalizeString(req.query.Region);
            query.Region = { $regex: new RegExp(normalizedRegion, "i") }; // Soft-match with regex
        }
        if (req.query.Country) {
            const normalizedCountry = normalizeString(req.query.Country);
            query.Country = { $regex: new RegExp(normalizedCountry, "i") }; // Soft-match with regex
        }

        const destinations = await destinationCollection.find(query).toArray();
        res.json(destinations);
    } catch (error) {
        console.error("Error searching destinations:", error);
        res.status(500).json({ error: "Failed to search destinations" });
    }
});




//Start the server
const PORT = process.env.PORT; //Might need to edit to have a fallback port!!!!!!

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

