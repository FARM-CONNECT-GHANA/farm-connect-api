import express from "express";
import cors from 'cors';
import expressOasGenerator from '@mickeymond/express-oas-generator';
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import mongoose from "mongoose";

// create express app
const farmconnectapp = express();
expressOasGenerator.handleResponses(farmconnectapp, {
    alwaysServeDocs: true,
    tags: ['users'],
    mongooseModels: mongoose.modelNames(),
})

// Apply middleware
farmconnectapp.use(cors({credentials: true, origin: '*'}));
farmconnectapp.use(express.json({ limit: '50mb' }));
farmconnectapp.use(express.urlencoded({ limit: '50mb', extended: true }));

// Use Routes
farmconnectapp.use('/users', userRoutes)

expressOasGenerator.handleRequests();
farmconnectapp.use((req, res) => res.redirect('/api-docs/'));


// Listen for incoming requests
const port = process.env.PORT || 8090;
dbConnection().then( () => {
farmconnectapp.listen(port, () => {
    console.log(`FarmConnect App listening on port ${port}`);
})});
