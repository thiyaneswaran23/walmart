const express = require('express');
const router = express.Router();
const upload = require('../storage/multerConfig'); 
const Products = require('../models/productSchema');
const Search = require('../models/searchShema'); 
const verifyToken = require('../middleware/verifyToken'); 
const cart=require('../models/cartSchema.js')
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
    if(!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }
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

router.post('/search',  async (req, res) => {
  try {
    const { searchTerm, id } = req.body;
    const search = new Search({ searchTerm, id });
    await search.save();
    res.status(201).json({ message: 'Search term saved successfully', search });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/recent-searches/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const searches = await Search.find({ id }).sort({ createdAt: -1 }).limit(5); 
    const terms = searches.map(item => item.searchTerm);
    res.json(terms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/review/:id', verifyToken, async (req, res) => {
  const { userId, userName, rating, comment } = req.body;

  if (!userId || !userName || !rating || !comment) {
    console.log(userId);
    console.log(userName);
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews?.some(
      (review) => review.userId === userId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      userId,
      userName,
      rating: Number(rating),
      comment,
    };

    product.reviews = product.reviews || [];
    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;

    await product.save();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ message: 'Server error while submitting review' });
  }
});
// GET unique seller names
router.get('/unique-sellers', async (req, res) => {
  try {
    const sellers = await Products.distinct('sellerName');
    res.status(200).json(sellers);
  } catch (err) {
    console.error('Error fetching unique sellers:', err);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// GET products by seller name (case-insensitive)
router.get('/products-by-seller/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;

    const products = await Products.find({
      sellerName: { $regex: new RegExp(`^${sellerName}$`, 'i') } // Case-insensitive exact match
    });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products by seller:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
