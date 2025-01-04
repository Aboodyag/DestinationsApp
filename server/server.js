const express = require("express");
require('dotenv').config();
const app = express()
const {dbConnect, client} = require('./config/dbConnect')
const cors = require('cors');

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
        const query = {};
        if (req.query.Name) query.Destination = { $regex: `^${req.query.Name}`, $options: "i" };
        if (req.query.Region) query.Region = { $regex: `^${req.query.Region}`, $options: "i" };
        if (req.query.Country) query.Country = { $regex: `^${req.query.Country}`, $options: "i" };

        const destinations = await destinationCollection.find(query).toArray();
        res.json(destinations);
    } catch (error) {
        console.error("Error searching destinations:", error);
        res.status(500).json({ error: "Failed to search destinations" });
    }
});




//Start the server
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

