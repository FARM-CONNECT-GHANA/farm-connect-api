import mongoose from "mongoose";
import 'dotenv/config';

// create database connection
export const dbConnection = async () => {
 try {
       await mongoose.connect(process.env.CONNECT_STRING);
       console.log('Connected to FarmConnect Database');
 } catch (error) {
    next(error)
 }
}
