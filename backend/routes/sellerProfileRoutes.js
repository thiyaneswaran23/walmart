const express = require('express');
const router = express.Router();
const Seller = require('../models/sellerSchema.js');
const verifyToken = require('../middleware/verifyToken'); 


router.put('/seller/update-profile', verifyToken, async (req, res) => {
  const { dob, address } = req.body;

  try {
    const user = await Seller.findByIdAndUpdate(
      req.user.id,                         
      { dob, address },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ 
      success: true, 
      message: "Profile updated", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        address: user.address
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
