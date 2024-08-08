import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { updateSubOrderStatus } from "../controllers/subOrder.controller.js";

const updateOrderRoute = Router();

/**
 * @openapi
 * /orders/{subOrderId}/status:
 *   patch:
 *     summary: Update the status of a sub-order
 *     description: Allows a farmer to update the status of a specific sub-order using its ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - name: subOrderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f26"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 example: "Shipped"
 *                 enum:
 *                   - Pending
 *                   - Shipped
 *                   - Delivered
 *                   - Canceled
 *     responses:
 *       200:
 *         description: Sub-order status successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sub-order status successfully updated"
 *       400:
 *         description: Bad request, invalid sub-order ID or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid sub-order ID or status"
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
 *       403:
 *         description: Forbidden, if the user does not have the 'farmer' role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden, insufficient permissions"
 *       404:
 *         description: Sub-order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sub-order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating the sub-order status."
 */
updateOrderRoute.patch('/orders/:subOrderId/status', authenticated, authorized(['farmer']), updateSubOrderStatus);

export default updateOrderRoute;