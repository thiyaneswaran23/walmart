const mongoose = require('mongoose');
const searchSchema=new mongoose.Schema({
    searchTerm: String,
    id:String
});
module.exports = mongoose.model("Search", searchSchema);