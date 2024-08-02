import express from "express";
import cors from 'cors';
import { dbConnection } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

// create express app
const farmconnectapp = express();

// Apply middleware
farmconnectapp.use(cors({credentials: true, origin: '*'}));
farmconnectapp.use(express.json());
farmconnectapp.use(userRoutes)


// Listen for incoming requests
const port = process.env.PORT || 8090;
dbConnection().then( () => {
farmconnectapp.listen(port, () => {
    console.log(`FarmConnect App listening on port ${port}`);
})});
