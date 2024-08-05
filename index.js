import express from "express";
import cors from 'cors';
import expressOasGenerator from '@mickeymond/express-oas-generator';
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import mongoose from "mongoose";
import productRoutes from "./routes/products.routes.js";
import { createServer } from 'http';
import { Server } from 'socket.io';
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import notificationRoute from "./routes/notification.routes.js";

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

// Middleware for Socket.IO
farmconnectapp.use((req, res, next) => {
    req.io = io;
    next();
});

// Setup OpenAPI documentation
expressOasGenerator.handleResponses(farmconnectapp, {
    alwaysServeDocs: true,
    tags: ['users', 'products'],
    mongooseModels: mongoose.modelNames(),
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

expressOasGenerator.handleRequests();
farmconnectapp.use((req, res) => res.redirect('/api-docs/'));

// Setup Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Example event for sending notifications
    socket.on('send-notification', (data) => {
        console.log('Notification received:', data);
        // Broadcast notification to all connected clients
        io.emit('receive-notification', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Listen for incoming requests
const port = process.env.PORT || 8090;
dbConnection().then(() => {
    server.listen(port, () => {
        console.log(`FarmConnect App listening on port ${port}`);
    });
});
