const express=require("express");
const router=express.Router();
const cart=require("../models/cartSchema.js");


router.post('/cartItems', async (req,res)=>{
    try{
        const cartItems=new cart({
            id:req.body.id,
            productName:req.body.productName,
            price:req.body.price,
            image:req.body.image
        })
        await cartItems.save();
        res.status(200).json({message:"product added to cart"});
    }catch(err){
            console.log(err);
            res.status(500).json({error:"server error"});
    }
})
module.exports=router;