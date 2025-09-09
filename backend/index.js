const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', 
    },
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const auth = require('./routes/authRoutes.js');
app.use('/api/auth', auth);

const pro = require('./routes/productRoutes.js');
app.use('/api/pro', pro);

const cart = require('./routes/cartRoutes.js');
app.use('/api/cart', cart);

const profile = require('./routes/profileRoutes.js');
app.use('/api/profile', profile);

const Seller = require('./routes/sellerProfileRoutes.js');
app.use('/ap/profile', Seller);

const messageRouter = require('./routes/message.js');
app.use('/api/messages', messageRouter);

const paymentRoute = require('./routes/payment');
app.use('/api/payment', paymentRoute);
const Message = require('./models/messageSchema');

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('sendMessage', async (data) => {
        try {
            const newMessage = new Message({
                senderId: data.senderId,
                receiverId: data.receiverId,
                productId: data.productId,
                message: data.message,
            });

            const savedMessage = await newMessage.save();
            io.emit('receiveMessage', savedMessage);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(5000, () => {
            console.log('Server running on port 5000 with WebSocket support');
        });
    })
    .catch(err => console.error(err));
