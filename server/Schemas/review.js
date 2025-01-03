const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    listName: {
        type: String,
        required: [true, 'List name is required'], //Error message
        trim: true //Removing spaces that are not needed
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'], //Error message
        min: [1, 'Rating must be at least 1'], //Min rating
        max: [5, 'Rating cannot exceed 5'], //Max rating
        validate: {
            validator: Number.isInteger, //Makes sure the rating is an integer
            message: 'Rating must be an integer value'
        }
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'], //Error message
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'] //Limits the comment length
    },
    userName: {
        type: String,
        required: [true, 'User name is required'], //Error message
        trim: true
    },
    isVisible: {
        type: Boolean,
        default: true //Visibility is true by default
    },
    creationDate: {
        type: Date,
        default: Date.now //Setting the creation date
    }
}, {
    timestamps: true //Adds the createdAt and updatedAt fields automatically
});

//Indexing for faster queries on searched fields that are more common
reviewSchema.index({ listName: 1 });
reviewSchema.index({ userName: 1 });

const Review = mongoose.model('Review', reviewSchema, 'reviews'); //Specifying collections name 

module.exports = Review;
