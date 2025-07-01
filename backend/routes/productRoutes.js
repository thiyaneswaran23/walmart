const express = require('express');
const router = express.Router();
const upload = require('../storage/multerConfig'); 
const Products = require('../models/productSchema');
const verifyToken = require('../middleware/verifyToken'); 
router.post('/products', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const product = new Products({
      sellerId: req.user.id, 
      sellerName: req.body.sellerName,
      productName: req.body.productName,
      price: req.body.price,
      image: [req.file.path], 
    });
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/products', verifyToken, async (req, res) => {
  try {
    const products = await Products.find({ sellerId: req.user.id });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all-products', async (req, res) => {
  try {
    const products = await Products.find();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await Products.findOne({ _id: req.params.id, sellerId: req.user.id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    await Products.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
