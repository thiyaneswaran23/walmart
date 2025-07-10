const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');





dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
