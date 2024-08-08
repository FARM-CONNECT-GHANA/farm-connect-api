import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import {createProduct, deleteProduct, getAllProducts, getFarmerProducts, getProductById, updateProduct} from "../controllers/product.controller.js";
import { remoteUpload } from "../middlewares/upload.js";

const productRoutes = Router();

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: This endpoint allows a farmer to create a new product, including uploading product images.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - stock
 *               - farmer
 *             properties:
 *               farmer:
 *                 type: string
 *                 format: ObjectId
 *                 description: The ID of the farmer who owns the product
 *                 example: "60c72b2f9b1e8b001a5c1f23"
 *               name:
 *                 type: string
 *                 description: The name of the product
 *                 example: "Organic Apples"
 *               description:
 *                 type: string
 *                 description: A detailed description of the product
 *                 example: "Freshly picked organic apples from our farm."
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the product
 *                 example: 3.99
 *               category:
 *                 type: string
 *                 enum: ['Fruits', 'Vegetables', 'Root & Tubers', 'Cereals & Grains', 'Legumes', 'Herbs & Spices', 'Nuts & Seeds', 'Animal Products', 'Dairy Products', 'Processed Foods', 'Others']
 *                 description: The category of the product
 *                 example: "Fruits"
 *               stock:
 *                 type: number
 *                 description: The stock quantity of the product
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 6 images of the product
 *             encoding:
 *               images:
 *                 contentType: image/jpeg, image/png
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product created successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f24"
 *                     farmer:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     name:
 *                       type: string
 *                       example: "Organic Apples"
 *                     description:
 *                       type: string
 *                       example: "Freshly picked organic apples from our farm."
 *                     price:
 *                       type: number
 *                       example: 3.99
 *                     category:
 *                       type: string
 *                       example: "Fruits"
 *                     stock:
 *                       type: number
 *                       example: 100
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: url
 *                       example: ["http://example.com/images/apple1.jpg", "http://example.com/images/apple2.jpg"]
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: name is required."
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
 *       403:
 *         description: Forbidden, user does not have the required role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You do not have access to this resource."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while creating the product."
 */
productRoutes.post("/products", remoteUpload.array("images", 6), authenticated, authorized(["farmer"]), createProduct);

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Retrieve all products, search by category, name, description, minPrice,maxPrice, sort in ascending or descending order
 *     description: This endpoint allows users to retrieve a list of all products.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f24"
 *                   farmer:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f23"
 *                   name:
 *                     type: string
 *                     example: "Organic Apples"
 *                   description:
 *                     type: string
 *                     example: "Freshly picked organic apples from our farm."
 *                   price:
 *                     type: number
 *                     example: 3.99
 *                   category:
 *                     type: string
 *                     example: "Fruits"
 *                   stock:
 *                     type: number
 *                     example: 100
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: url
 *                     example: ["http://example.com/images/apple1.jpg", "http://example.com/images/apple2.jpg"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving products."
 */
productRoutes.get("/products", getAllProducts);

/**
 * @openapi
 * /products/farmer:
 *   get:
 *     summary: Retrieve products for the logged-in farmer
 *     description: Fetches all products associated with the farmer who is currently logged in.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products associated with the farmer
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
 *                   name:
 *                     type: string
 *                     example: "Organic Apples"
 *                   description:
 *                     type: string
 *                     example: "Freshly picked organic apples from our farm."
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 3.99
 *                   farmer:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f23"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-08T12:34:56Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-08-08T12:34:56Z"
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
 *         description: Farmer not found for the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmer not found for this user."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the products."
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
productRoutes.get("/products/farmer", authenticated, authorized(['farmer']), getFarmerProducts);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: This endpoint allows users to retrieve details of a specific product by its ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f24"
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f24"
 *                 farmer:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f23"
 *                 name:
 *                   type: string
 *                   example: "Organic Apples"
 *                 description:
 *                   type: string
 *                   example: "Freshly picked organic apples from our farm."
 *                 price:
 *                   type: number
 *                   example: 3.99
 *                 category:
 *                   type: string
 *                   example: "Fruits"
 *                 stock:
 *                   type: number
 *                   example: 100
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: url
 *                   example: ["http://example.com/images/apple1.jpg", "http://example.com/images/apple2.jpg"]
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the product."
 */
productRoutes.get("/products/:id", getProductById);


/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     description: This endpoint allows a farmer to update an existing product, including uploading new product images.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f24"
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product
 *                 example: "Organic Apples"
 *               description:
 *                 type: string
 *                 description: A detailed description of the product
 *                 example: "Freshly picked organic apples from our farm."
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The price of the product
 *                 example: 3.99
 *               category:
 *                 type: string
 *                 enum: ['Fruits', 'Vegetables', 'Root & Tubers', 'Cereals & Grains', 'Legumes', 'Herbs & Spices', 'Nuts & Seeds', 'Animal Products', 'Dairy Products', 'Processed Foods', 'Others']
 *                 description: The category of the product
 *                 example: "Fruits"
 *               stock:
 *                 type: number
 *                 description: The stock quantity of the product
 *                 example: 100
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 6 new images of the product
 *             encoding:
 *               images:
 *                 contentType: image/jpeg, image/png
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f24"
 *                     farmer:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     name:
 *                       type: string
 *                       example: "Organic Apples"
 *                     description:
 *                       type: string
 *                       example: "Freshly picked organic apples from our farm."
 *                     price:
 *                       type: number
 *                       example: 3.99
 *                     category:
 *                       type: string
 *                       example: "Fruits"
 *                     stock:
 *                       type: number
 *                       example: 100
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: url
 *                       example: ["http://example.com/images/apple1.jpg", "http://example.com/images/apple2.jpg"]
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: price is required."
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
 *       403:
 *         description: Forbidden, user does not have the required role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You do not have access to this resource."
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while updating the product."
 */
productRoutes.patch("/products/:id", remoteUpload.array("images", 6), authenticated, authorized(["farmer"]), updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: This endpoint allows a farmer to delete a specific product by its ID.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: "60c72b2f9b1e8b001a5c1f24"
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
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
 *       403:
 *         description: Forbidden, user does not have the required role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: You do not have access to this resource."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while deleting the product."
 */
productRoutes.delete("/products/:id", authenticated, authorized(["farmer"]), deleteProduct);

export default productRoutes;
