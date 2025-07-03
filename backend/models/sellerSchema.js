const mongoose = require('mongoose');



const sellerSchema = new mongoose.Schema({
  name: String,
  gender: String,
  email: { type: String, unique: true },
  password: String,
   dob: String,      
  address: String,
});
module.exports = mongoose.model('Seller', sellerSchema);
