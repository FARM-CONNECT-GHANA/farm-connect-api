import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { cancelOrder, createOrder, getCustomerOrderHistory, getFarmerOrders, trackOrderById } from "../controllers/order.controller.js";

const orderRoutes = Router();


/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Allows a customer to create a new order by providing order details.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer:
 *                 type: string
 *                 example: "60c72b2f9b1e8b001a5c1f24"
 *               subOrders:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60c72b2f9b1e8b001a5c1f25", "60c72b2f9b1e8b001a5c1f26"]
 *               totalAmount:
 *                 type: number
 *                 example: 150.75
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   addressLine1:
 *                     type: string
 *                     example: "123 Farm Road"
 *                   addressLine2:
 *                     type: string
 *                     example: "Apt 4B"
 *                   city:
 *                     type: string
 *                     example: "Accra"
 *                   state:
 *                     type: string
 *                     example: "Greater Accra"
 *                   country:
 *                     type: string
 *                     example: "Ghana"
 *                   postalCode:
 *                     type: string
 *                     example: "00233"
 *     responses:
 *       201:
 *         description: Order successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f24"
 *                 customer:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f24"
 *                 subOrders:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60c72b2f9b1e8b001a5c1f25", "60c72b2f9b1e8b001a5c1f26"]
 *                 totalAmount:
 *                   type: number
 *                   example: 150.75
 *                 deliveryAddress:
 *                   type: object
 *                   properties:
 *                     addressLine1:
 *                       type: string
 *                       example: "123 Farm Road"
 *                     addressLine2:
 *                       type: string
 *                       example: "Apt 4B"
 *                     city:
 *                       type: string
 *                       example: "Accra"
 *                     state:
 *                       type: string
 *                       example: "Greater Accra"
 *                     country:
 *                       type: string
 *                       example: "Ghana"
 *                     postalCode:
 *                       type: string
 *                       example: "00233"
 *       400:
 *         description: Bad request, invalid order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid order details"
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
 *                   example: "An error occurred while creating the order."
 */
orderRoutes.post('/orders', authenticated, authorized(['customer']), createOrder)


/**
 * @openapi
 * /orders/farmer:
 *   get:
 *     summary: Retrieve orders for the logged-in farmer
 *     description: Fetches all orders associated with the farmer who is currently logged in.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders associated with the farmer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f24"
 *                   customer:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f25"
 *                   subOrders:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *                   totalAmount:
 *                     type: number
 *                     example: 150.75
 *                   deliveryAddress:
 *                     type: object
 *                     properties:
 *                       addressLine1:
 *                         type: string
 *                         example: "123 Farm Road"
 *                       addressLine2:
 *                         type: string
 *                         example: "Apt 4B"
 *                       city:
 *                         type: string
 *                         example: "Accra"
 *                       state:
 *                         type: string
 *                         example: "Greater Accra"
 *                       country:
 *                         type: string
 *                         example: "Ghana"
 *                       postalCode:
 *                         type: string
 *                         example: "00233"
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the orders."
 */
orderRoutes.get('/orders/farmer', authenticated, authorized(['farmer']), getFarmerOrders)

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retrieve customer order history
 *     description: Fetches the order history for the currently logged-in customer.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for the customer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f24"
 *                   customer:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f25"
 *                   subOrders:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *                   totalAmount:
 *                     type: number
 *                     example: 150.75
 *                   deliveryAddress:
 *                     type: object
 *                     properties:
 *                       addressLine1:
 *                         type: string
 *                         example: "123 Farm Road"
 *                       addressLine2:
 *                         type: string
 *                         example: "Apt 4B"
 *                       city:
 *                         type: string
 *                         example: "Accra"
 *                       state:
 *                         type: string
 *                         example: "Greater Accra"
 *                       country:
 *                         type: string
 *                         example: "Ghana"
 *                       postalCode:
 *                         type: string
 *                         example: "00233"
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
 *                   example: "An error occurred while retrieving the order history."
 */
orderRoutes.get('/orders', authenticated, getCustomerOrderHistory)

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Track an order retrieving by ID
 *     description: Fetches details of a specific order using its ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f24"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f24"
 *                 customer:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f25"
 *                 subOrders:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *                 totalAmount:
 *                   type: number
 *                   example: 150.75
 *                 deliveryAddress:
 *                   type: object
 *                   properties:
 *                     addressLine1:
 *                       type: string
 *                       example: "123 Farm Road"
 *                     addressLine2:
 *                       type: string
 *                       example: "Apt 4B"
 *                     city:
 *                       type: string
 *                       example: "Accra"
 *                     state:
 *                       type: string
 *                       example: "Greater Accra"
 *                     country:
 *                       type: string
 *                       example: "Ghana"
 *                     postalCode:
 *                       type: string
 *                       example: "00233"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
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
 *                   example: "An error occurred while retrieving the order."
 */
orderRoutes.get('/orders/:id', authenticated, trackOrderById)

/**
 * @openapi
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order by ID
 *     description: Allows the customer to cancel an existing order using its ID.
 *     tags:
 *       - Orders
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f24"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order successfully canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order successfully canceled"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
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
 *                   example: "An error occurred while canceling the order."
 */
orderRoutes.patch('/orders/:id/cancel', authenticated, cancelOrder)

export default orderRoutes;