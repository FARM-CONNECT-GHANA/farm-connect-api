import { Router } from "express";
import { getMessagesBetweenUsers, getMessagesByUserId, sendMessage } from "../controllers/message.controller.js";

const messageRoutes = Router();

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Send a new message
 *     description: Allows a user to send a new message to another user, creates a notification, and emits a real-time message using Socket.IO.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 example: "60c72b2f9b1e8b001a5c1f24"
 *               recipient:
 *                 type: string
 *                 example: "60c72b2f9b1e8b001a5c1f25"
 *               messageContent:
 *                 type: string
 *                 example: "Hello, how are you?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f26"
 *                 sender:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f24"
 *                 recipient:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f25"
 *                 messageContent:
 *                   type: string
 *                   example: "Hello, how are you?"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-08-13T15:22:34Z"
 *       400:
 *         description: Bad request, invalid message data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid message data"
 *       401:
 *         description: Unauthorized, if the user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while sending the message."
 */
messageRoutes.post('/messages', sendMessage);

/**
 * @openapi
 * /messages/conversation:
 *   get:
 *     summary: Get messages between two users
 *     description: Retrieves all messages exchanged between two specified users.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user1
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the first user
 *       - in: query
 *         name: user2
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the second user
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f26"
 *                       sender:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f24"
 *                       recipient:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f25"
 *                       messageContent:
 *                         type: string
 *                         example: "Hello, how are you?"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-13T15:22:34Z"
 *       400:
 *         description: Bad request, invalid user IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid user IDs"
 *       401:
 *         description: Unauthorized, if the user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving messages."
 */
messageRoutes.get('/messages/conversation', getMessagesBetweenUsers);

/**
 * @openapi
 * /messages/{userId}:
 *   get:
 *     summary: Get messages by user ID- displays message history
 *     description: Retrieves all messages sent or received by a specific user.
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f26"
 *                       sender:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f24"
 *                       recipient:
 *                         type: string
 *                         example: "60c72b2f9b1e8b001a5c1f25"
 *                       messageContent:
 *                         type: string
 *                         example: "Hello, how are you?"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-08-13T15:22:34Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       401:
 *         description: Unauthorized, if the user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving messages."
 */
messageRoutes.get('/messages/:userId', getMessagesByUserId);


export default messageRoutes;