import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const feedbackRoute = Router();

feedbackRoute.post('/feedback', authenticated, sendMessage)

export default feedbackRoute;