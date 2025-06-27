const mongoose = require('mongoose');



const sellerSchema = new mongoose.Schema({
  name: String,
  gender: String,
  email: { type: String, unique: true },
  password: String,
});
module.exports = mongoose.model('Seller', sellerSchema);
