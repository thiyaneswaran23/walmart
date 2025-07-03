const express=require("express");
const router=express.Router();
const cart=require("../models/cartSchema.js");

router.post('/cartItems', async (req, res) => {
    try {
        const cartItem = new cart({
            id: req.body.id,
            productName: req.body.productName,
            productId:req.body.productId,
            price: req.body.price,
            image: req.body.image,
            quantity: req.body.quantity || 1
        });
        await cartItem.save();
        res.status(200).json({ message: "Product added to cart" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});


router.get('/cartItems/:id', async(req,res)=>{
    const id=req.params.id;
    try{
        const cartItems=await cart.find({id:id});
        res.status(200).json(cartItems);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"server error"});
    }
})

router.delete('/cartItems/:id', async (req, res) => {
    const id= req.params.id;
    try {
        const check= await cart.findByIdAndDelete(id);
        if (!check) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.status(200).json({ message: "Item removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports=router;