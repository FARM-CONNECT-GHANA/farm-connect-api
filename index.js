import express from "express";
import cors from 'cors';
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/products.routes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import notificationRoute from "./routes/notification.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import updateOrderRoute from "./routes/subOrder.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import { swaggerDocs, swaggerUiSetup } from './config/swagger.js';
import feedbackRoute from "./routes/feedback.routes.js";
import errorHandler from "errorhandler";

// Create express app
const farmconnectapp = express();

// Create HTTP server
const server = createServer(farmconnectapp);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

farmconnectapp.set('io', io);

// Middleware for Socket.IO
farmconnectapp.use((req, res, next) => {
    req.io = io;
    next();
});

// Apply middleware
farmconnectapp.use(cors({ credentials: true, origin: '*' }));
farmconnectapp.use(express.json({ limit: '50mb' }));
farmconnectapp.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use Routes
farmconnectapp.use('/users', userRoutes);
farmconnectapp.use(productRoutes);
farmconnectapp.use(orderRoutes);
farmconnectapp.use(cartRoutes);
farmconnectapp.use(notificationRoute);
farmconnectapp.use(reviewRoutes);
farmconnectapp.use(updateOrderRoute);
farmconnectapp.use(messageRoutes);
farmconnectapp.use(feedbackRoute);

// Redirect root path to /api-docs
farmconnectapp.get('/', (req, res) => {
    res.redirect('/api-docs');
  });

// Setup Swagger UI
farmconnectapp.use('/api-docs', swaggerDocs, swaggerUiSetup);
farmconnectapp.use(errorHandler({log: false}));

// Setup Socket.IO connection
// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });

//     socket.on('error', (error) => {
//         console.error('Socket.IO error:', error);
//     });

// });

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle real-time messaging
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        // Emit the message to the intended recipient
        socket.to(receiverId).emit('receiveMessage', message);
    });

    // Handle notifications
    socket.on('sendNotification', (notification) => {
        console.log('Notification received:', notification);
        // Emit the notification to the intended recipient
       socket.to(recipientId).emit('receiveNotification', notification);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });

    // Optionally, handle custom events or rooms
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);
    });
});


// Listen for incoming requests
const port = process.env.PORT || 8090;
dbConnection().then(() => {
    server.listen(port, () => {
        console.log(`FarmConnect App listening on port ${port}`);
    });
});
