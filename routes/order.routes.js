import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { cancelOrder, createOrder, getOrderDetails, updateOrderStatus } from "../controllers/order.controller.js";

const orderRoutes = Router();

orderRoutes.post('/orders', authenticated, createOrder)

orderRoutes.get('/orders/:id', authenticated, getOrderDetails)

orderRoutes.patch('/orders/:id/status', authenticated, authorized(['farmer']), updateOrderStatus)

orderRoutes.patch('/orders/:id/cancel', authenticated, cancelOrder)

export default orderRoutes;