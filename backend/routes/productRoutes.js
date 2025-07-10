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
      category:req.body.category,
      price: req.body.price,
      stock: req.body.stock, 
      image: [req.file.path],
    });
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.put('/products/:id/refill', verifyToken, async (req, res) => {
  try {
    const { additionalStock } = req.body;

    const product = await Products.findOne({ _id: req.params.id, sellerId: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    product.stock += parseInt(additionalStock); 

    await product.save();
    res.status(200).json({ message: 'Stock refilled successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while refilling stock' });
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

router.get('/unique-sellers', async (req, res) => {
  try {
    const sellers = await Products.distinct('sellerName');
    res.status(200).json(sellers);
  } catch (err) {
    console.error('Error fetching unique sellers:', err);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

router.get('/products-by-seller/:sellerName', async (req, res) => {
  try {
    const sellerName = req.params.sellerName;

    const products = await Products.find({
      sellerName: { $regex: new RegExp(`^${sellerName}$`, 'i') } 
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
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const Notification = require('../models/notificationSchema.js');
const Order = require('../models/orderSchema.js');
router.post('/orders', verifyToken, async (req, res) => {
const {
  userId,
  userName,
  userEmail,
  userAddress,
  cartItems,
  subtotal,
  discount,
  total,
  pdfBase64, 
} = req.body;


  try {
    const enrichedCartItems = [];
    const sellerProductsMap = new Map(); 

    for (const item of cartItems) {
      const product = await Products.findById(item.productId);

      if (product) {
      
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

   
        const enrichedItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          sellerId: product.sellerId,
          image: product.image || '',
          category: product.category || '',
        };
        enrichedCartItems.push(enrichedItem);

        if (!sellerProductsMap.has(product.sellerId.toString())) {
          sellerProductsMap.set(product.sellerId.toString(), {
            products: [],
            total: 0,
          });
        }

        const sellerData = sellerProductsMap.get(product.sellerId.toString());

        sellerData.products.push({
          name: enrichedItem.name,
          quantity: item.quantity,
        });
        sellerData.total += product.price * item.quantity;
      }
    }

    const order = new Order({
      userId,
      userName,
      userEmail,
      userAddress,
      cartItems: enrichedCartItems,
      subtotal,
      discount,
      total,
    });

    const savedOrder = await order.save();
for (const [sellerId, data] of sellerProductsMap.entries()) {
  const productLines = data.products.map(p => `${p.name || 'Unknown'} (x${p.quantity})`).join(', ');
  const message = `🛒 New Order from ${userName} (${userEmail})\nProducts: ${productLines}\nTotal: ₹${data.total}`;

  let pdfFilePath = '';
  if (pdfBase64) {
    const buffer = Buffer.from(pdfBase64, 'base64');
    const filename = `receipt_${uuidv4()}.pdf`;
    const savePath = path.join(__dirname, '..', 'uploads', 'receipts', filename);

    fs.mkdirSync(path.dirname(savePath), { recursive: true });

    fs.writeFileSync(savePath, buffer);
    pdfFilePath = `/uploads/receipts/${filename}`; 
  }

  const notification = new Notification({
    sellerId,
    message,
    orderId: savedOrder._id,
    pdfReceipt: pdfFilePath,
  });

  await notification.save();
}


    res.status(201).json({
      message: 'Order placed, stock updated, and notifications sent',
      order: savedOrder,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  const { sellerId } = req.query;

  if (!sellerId) {
    return res.status(400).json({ error: 'Missing sellerId in query' });
  }

  try {
    const notifications = await Notification.find({ sellerId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});



module.exports = router;
