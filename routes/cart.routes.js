import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { addItemToCart, getCartItems, removeItemFromCart } from "../controllers/cart.controller.js";

const cartRoutes = Router();

/**
 * @openapi
 * /cart:
 *   post:
 *     summary: Add an item to the cart
 *     description: This endpoint allows a user to add a new item to/ update their cart.
 *     tags:
 *       - Cart
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
 *                 format: ObjectId
 *                 description: The ID of the customer adding the item.
 *                 example: "605c72ef65f9b8f3e8b45678"
 *               product:
 *                 type: string
 *                 format: ObjectId
 *                 description: The ID of the product being added to the cart.
 *                 example: "605c72ef65f9b8f3e8b87654"
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to add.
 *                 example: 2
 *     responses:
 *       201:
 *         description: Cart item successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item added to cart successfully"
 *                 cartItem:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5f4847d7e4b001a4b1f28"
 *                     customer:
 *                       type: string
 *                       example: "605c72ef65f9b8f3e8b45678"
 *                     product:
 *                       type: string
 *                       example: "605c72ef65f9b8f3e8b87654"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: quantity is required."
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
cartRoutes.post('/cart', authenticated, addItemToCart)

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Get all items in the cart
 *     description: Retrieves all items currently in the user's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items in the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d5f4847d7e4b001a4b1f28"
 *                   customer:
 *                     type: string
 *                     example: "605c72ef65f9b8f3e8b45678"
 *                   product:
 *                     type: string
 *                     example: "605c72ef65f9b8f3e8b87654"
 *                   quantity:
 *                     type: integer
 *                     example: 2
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
cartRoutes.get('/cart', authenticated, getCartItems)

/**
 * @openapi
 * /cart/{id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: This endpoint allows a user to remove a specific item from their cart using its ID.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60d5f4847d7e4b001a4b1f28"
 *     responses:
 *       200:
 *         description: Cart item successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item removed from cart successfully"
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart item not found"
 *       401:
 *         description: Unauthorized, authentication required
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
 *                   example: "An error occurred while removing the item."
 */
cartRoutes.delete('/cart/:id', authenticated, removeItemFromCart)

export default cartRoutes;