import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { addItemToCart, getCartItems, removeItemFromCart } from "../controllers/cart.controller.js";

const cartRoutes = Router();

cartRoutes.post('/cart', authenticated, addItemToCart)

cartRoutes.get('/cart', authenticated, getCartItems)

cartRoutes.delete('/cart/:id', authenticated, removeItemFromCart)

export default cartRoutes;