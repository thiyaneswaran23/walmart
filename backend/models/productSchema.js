const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  sellerName: String,
  productName: String,
  price: Number,
  image: [String]
});

module.exports = mongoose.model("Products", productSchema);
