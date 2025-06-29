const mongoose=require("mongoose");

const cartSchema=new mongoose.Schema({
        id:String,
        productName:String,
        price:Number,
        image:[String]
});

module.exports=mongoose.model("cart",cartSchema);