import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { cancelOrder, createOrder, getFarmerOrders, getOrderDetails } from "../controllers/order.controller.js";

const orderRoutes = Router();

orderRoutes.post('/orders', authenticated, createOrder)

orderRoutes.get('/orders/:id', authenticated, getOrderDetails)

orderRoutes.get('/orders/farmer', authenticated, authorized(['farmer']), getFarmerOrders)

orderRoutes.patch('/orders/:id/cancel', authenticated, cancelOrder)

export default orderRoutes;