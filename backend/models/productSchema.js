const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: String,
  sellerName: String,
  productName: String,
  price: Number,
  image: [String]
});

module.exports = mongoose.model("Products", productSchema);
