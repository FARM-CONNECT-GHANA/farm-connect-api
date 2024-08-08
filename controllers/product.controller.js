import {ProductModel} from '../models/product.model.js'; 
import { productUpdateValidator, productValidator } from '../utils/validation.js';
import { FarmerModel } from '../models/farmer.model.js';
import mongoose from 'mongoose';



export const createProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Check if the userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find the corresponding farmer using the userId
        const farmer = await FarmerModel.findOne({ user: userId }).exec();

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        console.log('Creating product for Farmer ID:', farmer._id); // Debugging output

        const { name, description, price, category, stock } = req.body;

        // Validate the input using Joi
        const { error } = productValidator.validate({ name, price, stock });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Handle file uploads
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename);
        }

        // Create a new product
        const newProduct = await ProductModel.create({
            farmer: farmer._id, // Use the farmer's ObjectId
            name,
            description,
            price,
            category,
            stock,
            images
        });

        console.log('New product created:', newProduct); // Debugging output

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'An error occurred while creating the product' });
        next(error);
    }
};



// function to get all products with search functionality and category as a string field within product model
export const getAllProducts = async (req, res, next) => {
    try {
        const {
            keyword = '',
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sort = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        let searchQuery = {};

        // Convert `minPrice` and `maxPrice` to numbers
        const minPriceNum = Number(minPrice);
        const maxPriceNum = Number(maxPrice);

        // Search by name, description, or category if keyword is provided
        if (keyword) {
            searchQuery.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Filter by category 
        if (category) {
            searchQuery.category = category;
        }

        // Filter by price range
        if (!isNaN(minPriceNum)) {
            searchQuery.price = { ...searchQuery.price, $gte: minPriceNum };
        }
        if (!isNaN(maxPriceNum)) {
            searchQuery.price = { ...searchQuery.price, $lte: maxPriceNum };
        }

        // Sorting
        const sortOrder = sort === 'asc' ? 1 : -1;
        const validSortFields = ['name', 'price', 'createdAt']; 
        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({ message: 'Invalid sort field' });
        }

        let query = ProductModel.find(searchQuery)
        // .populate({
        //     path: 'farmer',
        //     select: 'farmName' // Only include the farmName field from the Farmer model
        // })
            .sort({ [sortBy]: sortOrder });

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        query = query.skip(skip).limit(Number(limit));

        // Execute the query to get products
        const products = await query;

        res.status(200).json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching products' });
        next(error);
    }
};


// function to get one product
export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findById(id)
            // .populate('farmer', 'farmName') 
            // .select('-farmer')
            .populate('category', 'name');

            console.log('Farmer ID:', product.farmer);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Debugging output
        if (!product.farmer) {
            console.warn(`Farmer not found for product with ID: ${id}`);
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the product' });
        next(error);
    }
};


// get farmer products
export const getFarmerProducts = async (req, res, next) => {
    try {
        const userId = req.user.id;  // Get the user ID from the request
        console.log('User ID:', userId); // Debugging

        // Find the farmer associated with the user
        const farmer = await FarmerModel.findOne({ user: userId });
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found for this user.' });
        }

        const farmerId = farmer._id;  // Get the farmer's ID
        console.log('Farmer ID:', farmerId); // Debugging

        // Validate that farmerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ message: 'Invalid farmer ID.' });
        }

        // Find all products associated with the farmer
        const products = await ProductModel.find({ farmer: farmerId });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error retrieving farmer products:', error);
        res.status(500).json({ message: 'An error occurred while retrieving the products' });
        next(error);
    }
};




// function to update product
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;  // Get the user ID from the request

        // Validate the input using Joi
        const { error } = productUpdateValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Handle file uploads
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename);
        }

        // Prepare the update object
        const { name, description, price, category, stock } = req.body;
        const updateData = {
            name,
            description,
            price,
            category,
            stock,
            images: images.length > 0 ? images : undefined, // Only include images if there are any
        };

        // Find the farmer associated with the user
        const farmer = await FarmerModel.findOne({ user: userId });
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found for this user.' });
        }

        const farmerId = farmer._id;  // Get the farmer's ID

        // Find the product and check if the farmer matches
        const product = await ProductModel.findOne({ _id: id, farmer: farmerId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized to update this product' });
        }

        // Update the product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the product' });
        next(error);
    }
};




// delete a product
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;  // Get the user ID from the request

        // Find the farmer associated with the user
        const farmer = await FarmerModel.findOne({ user: userId });
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found for this user.' });
        }

        const farmerId = farmer._id;  // Get the farmer's ID

        // Find the product and check if the farmer matches
        const product = await ProductModel.findOne({ _id: id, farmer: farmerId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or not authorized to delete this product' });
        }

        // Delete the product
        await ProductModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'An error occurred while deleting the product' });
        next(error);
    }
};


