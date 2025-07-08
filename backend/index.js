const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const auth=require('./routes/authRoutes.js');
app.use('/api/auth',auth);
const pro=require('./routes/productRoutes.js');
app.use('/api/pro',pro);
const cart=require('./routes/cartRoutes.js');
app.use('/api/cart',cart);
const profile=require('./routes/profileRoutes.js');
app.use('/api/profile',profile);
const Seller=require('./routes/sellerProfileRoutes.js');
app.use('/ap/profile',Seller);
const message=require('./routes/message.js');
app.use('/api/messages',message);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => console.error(err));
