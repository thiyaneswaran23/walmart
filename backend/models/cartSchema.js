const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  id: { type: String, required: true },  // user ID
  sellerId: { type: String, required: true }, 
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String], required: true },
  quantity: { type: Number, default: 1 },
  purchased: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now }  
});


module.exports = mongoose.model("Cart", cartSchema);
