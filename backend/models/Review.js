const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Adjust this to false if you want to allow anonymous reviews without a userId
    },
    title: {
        type: String,
        required: true,
        maxlength: 200 // You can set a maximum length for the title
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true // adds createdAt & updatedAt
});

module.exports = mongoose.model('Review', reviewSchema);