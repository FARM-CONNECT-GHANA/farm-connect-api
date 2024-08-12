import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { submitFeedback } from "../controllers/feedback.controller.js";

const feedbackRoute = Router();

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Submit user feedback
 *     description: Allows authenticated users to submit feedback, which is then saved in the database and triggers email notifications to both the admin and the user.
 *     tags:
 *       - Feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: "Product Improvement Suggestion"
 *               message:
 *                 type: string
 *                 example: "I think the product could benefit from additional features."
 *     responses:
 *       201:
 *         description: Feedback successfully submitted and notifications sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback submitted successfully"
 *       400:
 *         description: Bad request if the feedback data is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid feedback data: [error details]"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to submit feedback"
 */
feedbackRoute.post('/feedback', authenticated, submitFeedback)

export default feedbackRoute;