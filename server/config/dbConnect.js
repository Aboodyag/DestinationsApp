const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://test:test@myapp.vvmry.mongodb.net/?retryWrites=true&w=majority&appName=Myapp";
const client = new MongoClient(MONGO_URI);

async function dbConnect() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

module.exports = { dbConnect, client };