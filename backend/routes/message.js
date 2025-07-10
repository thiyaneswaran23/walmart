const express = require('express');
const router = express.Router();
const Message = require('../models/messageSchema');

// Send a message
router.post('/', async (req, res) => {
  const { senderId, receiverId, productId, message } = req.body;

  try {
    const newMessage = new Message({ senderId, receiverId, productId, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation between buyer and seller
router.get('/:user1/:user2/:productId', async (req, res) => {
  const { user1, user2, productId } = req.params;

  try {
    const messages = await Message.find({
      productId,
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get unique buyer-product conversations for a seller
router.get('/by-seller/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const messages = await Message.find({ receiverId: sellerId })
      .populate('senderId', 'name')
      .populate('productId', 'productName');

    const uniqueConversationsMap = {};

    messages.forEach(msg => {
      if (!msg.senderId || !msg.productId) {
        console.warn(`Skipping message ${msg._id} due to missing reference.`);
        return;
      }

      const key = `${msg.senderId._id}_${msg.productId._id}`;
      if (!uniqueConversationsMap[key]) {
        uniqueConversationsMap[key] = {
          buyerId: msg.senderId._id,
          buyerName: msg.senderId.name,
          productId: msg.productId._id,
          productName: msg.productId.productName
        };
      }
    });

    const uniqueConversations = Object.values(uniqueConversationsMap);
    res.json(uniqueConversations);

  } catch (err) {
    console.error('Error fetching buyer conversations:', err);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});



module.exports = router;
