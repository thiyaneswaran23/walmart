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
            quantity: req.body.quantity || 1,
             sellerId: req.body.sellerId
        });
        await cartItem.save();
        res.status(200).json({ message: "Product added to cart" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/checkout/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    await cart.updateMany(
      { id: userId, purchased: false },
      { $set: { purchased: true } }
    );
    res.status(200).json({ message: 'Checkout successful' });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Server error' });
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

// GET /analytics/:sellerId
router.get('/analytics/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const purchases = await cart.find({
      sellerId,
      purchased: true,
    });

    const summary = {};

    purchases.forEach((item) => {
      if (!summary[item.productName]) {
        summary[item.productName] = {
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      summary[item.productName].totalSold += item.quantity;
      summary[item.productName].totalRevenue += item.quantity * item.price;
    });

    const result = Object.entries(summary).map(([productName, data]) => ({
      productName,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
});

module.exports=router;