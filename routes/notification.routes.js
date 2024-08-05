import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { markNotificationAsRead } from "../controllers/notification.controller.js";

const notificationRoute = Router();

notificationRoute.patch('/notifications/:id/read', authenticated, markNotificationAsRead)

export default notificationRoute