const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List', // Reference the List schema
        required: [true, 'List ID is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Reference the User schema
        required: [true, 'User ID is required']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;
