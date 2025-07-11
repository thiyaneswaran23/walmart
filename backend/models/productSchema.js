const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const productSchema = new mongoose.Schema({
    sellerId: String,
    sellerName: String,
    productName: String,
    price: Number,
      stock: {
    type: Number,
    required: true,
    default: 0,
   
  },
   category: {
        type: String,
        
    },
    image: [String], 
    reviews: [reviewSchema], 
});

module.exports = mongoose.model("Products", productSchema);
