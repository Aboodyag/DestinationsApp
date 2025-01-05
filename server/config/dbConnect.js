const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://test:test@myapp.vvmry.mongodb.net/?retryWrites=true&w=majority&appName=Myapp";
const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



async function dbConnect() {
    try {
        // Connect MongoClient
        await client.connect();

        console.log("!!!--------------CONNECTED to MongoDB with MongoClient--------------!!!");

        // Connect Mongoose
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("!!!--------------CONNECTED to MongoDB with Mongoose-------------!!!");

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

module.exports = { dbConnect, client };