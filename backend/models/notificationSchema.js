const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  pdfReceipt: { 
    type: String 
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Notification', notificationSchema);
