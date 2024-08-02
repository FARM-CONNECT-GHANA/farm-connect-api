import { Router } from "express";
import { createCustomerProfile, createFarmerProfile, getCustomerProfile, getFarmerProfile, register, tokenLogin, updateCustomerProfile, updateFarmerProfile } from "../controllers/user.controller.js";
import { remoteUpload } from "../middlewares/upload.js";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";

const userRoutes = Router();

userRoutes.post('/register', register)

userRoutes.post('/login', tokenLogin)

userRoutes.post('/farmerprofile', remoteUpload.array('farmPhotos', 6), authenticated, authorized(['farmer']), createFarmerProfile)

userRoutes.get('/farmerprofile', authenticated, getFarmerProfile)

userRoutes.get('/farmerprofile/:id', getFarmerProfile)

userRoutes.patch('/farmerprofile', remoteUpload.array('farmPhotos', 6), authenticated, authorized(['farmer']), updateFarmerProfile)

userRoutes.post('/customerprofile', authenticated, authorized(['customer']), createCustomerProfile)

userRoutes.get('/customerprofile', authenticated, getCustomerProfile)

userRoutes.patch('/customerprofile', authenticated, authorized(['customer']), updateCustomerProfile)

export default userRoutes