import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { updateSubOrderStatus } from "../controllers/subOrder.controller.js";

const updateOrderRoute = Router();

updateOrderRoute.patch('/orders/:subOrderId/status', authenticated, authorized(['farmer']), updateSubOrderStatus);

export default updateOrderRoute;