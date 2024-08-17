import { Router } from "express";
import { createCustomerProfile, createFarmerProfile, getCustomerProfile, getFarmerProfile, logout, register, tokenLogin, updateCustomerProfile, updateFarmerProfile } from "../controllers/user.controller.js";
import { remoteUpload } from "../middlewares/upload.js";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";

const userRoutes = Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: Registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Busola
 *               lastName:
 *                 type: string
 *                 example: Tom
 *               email:
 *                 type: string
 *                 example: busolatom@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *               phone:
 *                 type: string
 *                 example: 012345678
 *               role:
 *                 type: string
 *                 example: farmer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
userRoutes.post('/register', register)

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User login details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: busolatom@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
userRoutes.post('/login', tokenLogin)

/**
 * @openapi
 * /users/logout:
 *   post:
 *     summary: Logout a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Logs out the authenticated user by invalidating their access token.
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: No token provided or user is not authenticated
 *       500:
 *         description: Logout failed due to a server error
 */
userRoutes.post('/logout', authenticated, logout)

/**
 * @openapi
 * /users/farmerprofile:
 *   post:
 *     summary: Create a farmer's profile
 *     description: This endpoint allows a farmer to create their profile, including uploading farm photos.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - farmName
 *               - user
 *             properties:
 *               user:
 *                 type: string
 *                 format: ObjectId
 *                 description: The user ID associated with the farmer
 *                 example: "60c72b2f9b1e8b001a5c1f23"
 *               farmName:
 *                 type: string
 *                 description: The name of the farm
 *                 example: "Green Acres Farm"
 *               farmAddress:
 *                 type: string
 *                 description: The physical address of the farm
 *                 example: "123 Farm Lane, Springfield"
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of product IDs associated with the farm
 *                 example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *               farmType:
 *                 type: string
 *                 enum: ['organic', 'conventional']
 *                 description: The type of farm
 *                 example: "organic"
 *               bankAccountDetails:
 *                 type: string
 *                 description: The farmer's bank account details for payments
 *                 example: "Account Number: 123456789, Bank: ABC Bank"
 *               about:
 *                 type: string
 *                 description: A brief description of the farm
 *                 example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *               farmPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 6 farm photos
 *             encoding:
 *               farmPhotos:
 *                 contentType: image/jpeg, image/png
 *     responses:
 *       200:
 *         description: Farmer profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmer profile created successfully"
 *                 farmerProfile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     farmName:
 *                       type: string
 *                       example: "Green Acres Farm"
 *                     farmAddress:
 *                       type: string
 *                       example: "123 Farm Lane, Springfield"
 *                     products:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *                     farmType:
 *                       type: string
 *                       example: "organic"
 *                     bankAccountDetails:
 *                       type: string
 *                       example: "Account Number: 123456789, Bank: ABC Bank"
 *                     about:
 *                       type: string
 *                       example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *                     farmPhotos:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: url
 *                       example: ["http://example.com/farmphotos/photo1.jpg", "http://example.com/farmphotos/photo2.jpg"]
 *       400:
 *         description: Invalid input, missing required fields, or other validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: farmName is required."
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
 *                   example: "An error occurred while creating the farmer profile."
 */
userRoutes.post('/farmerprofile', remoteUpload.array('farmPhotos', 6), authenticated, authorized(['farmer']), createFarmerProfile)

/**
 * @openapi
 * /users/farmerprofile:
 *   get:
 *     summary: Retrieve all farmer profile
 *     description: This endpoint allows authenticated users to retrieve their farmer profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of farmer profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "60c72b2f9b1e8b001a5c1f23"
 *                   farmName:
 *                     type: string
 *                     example: "Green Acres Farm"
 *                   farmAddress:
 *                     type: string
 *                     example: "123 Farm Lane, Springfield"
 *                   products:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: ObjectId
 *                     example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *                   farmType:
 *                     type: string
 *                     example: "organic"
 *                   bankAccountDetails:
 *                     type: string
 *                     example: "Account Number: 123456789, Bank: ABC Bank"
 *                   about:
 *                     type: string
 *                     example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *                   farmPhotos:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: url
 *                     example: ["http://example.com/farmphotos/photo1.jpg", "http://example.com/farmphotos/photo2.jpg"]
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
 *                   example: "An error occurred while retrieving farmer profiles."
 */
userRoutes.get('/farmerprofile', authenticated, getFarmerProfile)

/**
 * @openapi
 * /users/farmerprofile/{id}:
 *   get:
 *     summary: Retrieve a single farmer profile by ID
 *     description: This endpoint allows authenticated users to retrieve a specific farmer profile by its ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the farmer profile to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f23"
 *                 farmName:
 *                   type: string
 *                   example: "Green Acres Farm"
 *                 farmAddress:
 *                   type: string
 *                   example: "123 Farm Lane, Springfield"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *                   example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *                 farmType:
 *                   type: string
 *                   example: "organic"
 *                 bankAccountDetails:
 *                   type: string
 *                   example: "Account Number: 123456789, Bank: ABC Bank"
 *                 about:
 *                   type: string
 *                   example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *                 farmPhotos:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: url
 *                   example: ["http://example.com/farmphotos/photo1.jpg", "http://example.com/farmphotos/photo2.jpg"]
 *       404:
 *         description: Farmer profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmer profile not found"
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
 *                   example: "An error occurred while retrieving the farmer profile."
 */
userRoutes.get('/farmerprofile/:id', getFarmerProfile)

/**
 * @openapi
 * /users/farmerprofile:
 *   patch:
 *     summary: Update a farmer's profile
 *     description: This endpoint allows an authenticated farmer to update their profile information. You can also upload up to 6 farm photos.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               farmName:
 *                 type: string
 *                 description: The name of the farm
 *                 example: "Green Acres Farm"
 *               farmAddress:
 *                 type: string
 *                 description: The physical address of the farm
 *                 example: "123 Farm Lane, Springfield"
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of product IDs associated with the farm
 *                 example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *               farmType:
 *                 type: string
 *                 enum: ['organic', 'conventional']
 *                 description: The type of farm
 *                 example: "organic"
 *               bankAccountDetails:
 *                 type: string
 *                 description: The farmer's bank account details for payments
 *                 example: "Account Number: 123456789, Bank: ABC Bank"
 *               about:
 *                 type: string
 *                 description: A brief description of the farm
 *                 example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *               farmPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 6 farm photos
 *             encoding:
 *               farmPhotos:
 *                 contentType: image/jpeg, image/png
 *     responses:
 *       200:
 *         description: Farmer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Farmer profile updated successfully"
 *                 farmerProfile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     farmName:
 *                       type: string
 *                       example: "Green Acres Farm"
 *                     farmAddress:
 *                       type: string
 *                       example: "123 Farm Lane, Springfield"
 *                     products:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b3e9b1e8b001a5c1f24", "60c72b3e9b1e8b001a5c1f25"]
 *                     farmType:
 *                       type: string
 *                       example: "organic"
 *                     bankAccountDetails:
 *                       type: string
 *                       example: "Account Number: 123456789, Bank: ABC Bank"
 *                     about:
 *                       type: string
 *                       example: "We are a small family-owned organic farm specializing in seasonal vegetables."
 *                     farmPhotos:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: url
 *                       example: ["http://example.com/farmphotos/photo1.jpg", "http://example.com/farmphotos/photo2.jpg"]
 *       400:
 *         description: Invalid input, missing required fields, or other validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: farmName is required."
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
 *                   example: "An error occurred while updating the farmer profile."
 */
userRoutes.patch('/farmerprofile', remoteUpload.array('farmPhotos', 6), authenticated, authorized(['farmer']), updateFarmerProfile)

/**
 * @openapi
 * /users/customerprofile:
 *   post:
 *     summary: Create a customer profile
 *     description: This endpoint allows an authenticated customer to create their profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: string
 *                 format: ObjectId
 *                 description: The user ID associated with the customer
 *                 example: "60c72b2f9b1e8b001a5c1f23"
 *               preferredPaymentMethod:
 *                 type: string
 *                 enum: ['cash', 'Mobile Money', 'Bank Deposit']
 *                 description: The preferred payment method of the customer
 *                 example: "Mobile Money"
 *               orderHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of order IDs associated with the customer
 *                 example: ["60c72b2f9b1e8b001a5c1f24", "60c72b2f9b1e8b001a5c1f25"]
 *               cart:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of cart item IDs associated with the customer
 *                 example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *     responses:
 *       201:
 *         description: Customer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer profile created successfully"
 *                 customerProfile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     user:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     preferredPaymentMethod:
 *                       type: string
 *                       example: "Mobile Money"
 *                     orderHistory:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b2f9b1e8b001a5c1f24", "60c72b2f9b1e8b001a5c1f25"]
 *                     cart:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: user is required."
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
 *                   example: "An error occurred while creating the customer profile."
 */
userRoutes.post('/customerprofile', authenticated, authorized(['customer']), createCustomerProfile)

/**
 * @openapi
 * /users/customerprofile:
 *   get:
 *     summary: Retrieve customer profile
 *     description: This endpoint allows an authenticated customer to retrieve their profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f23"
 *                 user:
 *                   type: string
 *                   example: "60c72b2f9b1e8b001a5c1f23"
 *                 preferredPaymentMethod:
 *                   type: string
 *                   example: "Mobile Money"
 *                 orderHistory:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *                   example: ["60c72b2f9b1e8b001a5c1f24", "60c72b2f9b1e8b001a5c1f25"]
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: ObjectId
 *                   example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
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
 *       404:
 *         description: Customer profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer profile not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while retrieving the customer profile."
 */
userRoutes.get('/customerprofile', authenticated, getCustomerProfile)

/**
 * @openapi
 * /customerprofile:
 *   patch:
 *     summary: Update a customer profile
 *     description: This endpoint allows an authenticated customer to update their profile details.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredPaymentMethod:
 *                 type: string
 *                 enum: ['cash', 'Mobile Money', 'Bank Deposit']
 *                 description: The preferred payment method of the customer
 *                 example: "Bank Deposit"
 *               orderHistory:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of order IDs associated with the customer
 *                 example: ["60c72b2f9b1e8b001a5c1f24", "60c72b2f9b1e8b001a5c1f25"]
 *               cart:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *                 description: List of cart item IDs associated with the customer
 *                 example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *     responses:
 *       200:
 *         description: Customer profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer profile updated successfully"
 *                 customerProfile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     user:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001a5c1f23"
 *                     preferredPaymentMethod:
 *                       type: string
 *                       example: "Bank Deposit"
 *                     orderHistory:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b2f9b1e8b001a5c1f24", "60c72b2f9b1e8b001a5c1f25"]
 *                     cart:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: ObjectId
 *                       example: ["60c72b2f9b1e8b001a5c1f26", "60c72b2f9b1e8b001a5c1f27"]
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: preferredPaymentMethod is not allowed."
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
 *                   example: "An error occurred while updating the customer profile."
 */
userRoutes.patch('/customerprofile', authenticated, authorized(['customer']), updateCustomerProfile)

export default userRoutes 