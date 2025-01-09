const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    avgRating: {
        type: Number,
        default: 0,
    },
    destinations: [{
        destinationId: Number,
        destinationName: String, // For storing destination name
        latitude: Number,
        longitude: Number
    }], // Updated to handle detailed destination objects
    isPublic: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: false
    },
    listOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }
    }, 
    {
    timestamps: { updatedAt: 'lastModified' }
});

const List = mongoose.model('List', listSchema, "Lists");
module.exports = List;