import { Router } from "express";
import { getMessages, sendMessage, updateMessageStatus } from "../controllers/message.controller.js";

const messageRoutes = Router();

messageRoutes.post('/messages', sendMessage);

messageRoutes.get('/messages/:userId', getMessages);

messageRoutes.patch('/messages/:messageId/status', updateMessageStatus);

export default messageRoutes;