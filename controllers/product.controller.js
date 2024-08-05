import {ProductModel} from '../models/product.model.js'; 
import { productUpdateValidator, productValidator } from '../utils/validation.js';
import { FarmerModel } from '../models/farmer.model.js';

// function to add product
export const createProduct = async (req, res, next) => {
    try {
        const farmer = req.user.id; 
        console.log('Creating product for Farmer ID:', farmer); // Debugging output

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
            farmer,
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


// function to get all products with searching, filtering, sorting, pagination
export const getAllProducts = async (req, res, next) => {
    try {
        // Extract query parameters for searching, filtering, sorting, and pagination
        const {
            keyword,
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt', // Default sorting by creation date
            sort = 'desc', // Default sort order
            page = 1,
            limit = 10
        } = req.query;

        // Initialize the search query object
        let searchQuery = {};

        // Search by keyword in name or description
        if (keyword) {
            searchQuery.$or = [
                { name: { $regex: keyword, $options: 'i' } }, // Case-insensitive search in name
                { description: { $regex: keyword, $options: 'i' } } // Case-insensitive search in description
            ];
        }

        // Filter by category
        if (category) {
            searchQuery.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            searchQuery.price = {};
            if (minPrice) searchQuery.price.$gte = minPrice; // Greater than or equal to minPrice
            if (maxPrice) searchQuery.price.$lte = maxPrice; // Less than or equal to maxPrice
        }

        // Sorting
        const sortOrder = sort === 'asc' ? 1 : -1;
        let query = ProductModel.find(searchQuery)
            .sort({ [sortBy]: sortOrder }) // Sort by the specified field and order
            .populate('category', 'name'); // Populate category name

        // Pagination
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit); // Apply pagination

        // Execute the query to get products
        const products = await query;

        // Return the products
        res.status(200).json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching products' });
        next(error);
    }
};
  

// function to get all products with search functionality and category as a string field within product model
// export const getAllProducts = async (req, res, next) => {
//     try {
//         const {
//             keyword,
//             category,
//             minPrice,
//             maxPrice,
//             sortBy = 'createdAt',
//             sort = 'desc',
//             page = 1,
//             limit = 10
//         } = req.query;

//         let searchQuery = {};

//         // Search by name, description, or category if category is a string field
//         if (keyword) {
//             searchQuery.$or = [
//                 { name: { $regex: keyword, $options: 'i' } },
//                 { description: { $regex: keyword, $options: 'i' } },
//                 { category: { $regex: keyword, $options: 'i' } } // Adjusted for embedded category
//             ];
//         }

//         // Filter by category (assuming category is a string field)
//         if (category) {
//             searchQuery.category = category;
//         }

//         // Filter by price range
//         if (minPrice) {
//             searchQuery.price = { $gte: minPrice };
//         }
//         if (maxPrice) {
//             searchQuery.price = { ...searchQuery.price, $lte: maxPrice };
//         }

//         // Sorting
//         const sortOrder = sort === 'asc' ? 1 : -1;
//         let query = ProductModel.find(searchQuery)
//             .sort({ [sortBy]: sortOrder });

//         // Pagination
//         const skip = (page - 1) * limit;
//         query = query.skip(skip).limit(limit);

//         // Execute the query to get products
//         const products = await query;

//         res.status(200).json({ products });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred while fetching products' });
//         next(error);
//     }
// };



// function to get one product
export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await ProductModel.findById(id)
            // .populate('farmer', 'farmName') 
            .select('-farmer')
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


// function to update product
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, stock } = req.body;

        // Validate the input using Joi
        const { error } = productUpdateValidator.validate({ name, price, stock });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Handle file uploads
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename); 
        }

        // Prepare the update object
        const updateData = {
            name,
            description,
            price,
            category,
            stock,
        };

        // If new images are uploaded, update the images field
        if (images.length > 0) {
            updateData.images = images;
        }

        // Update the product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

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

        const deletedProduct = await ProductModel.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the product' });
        next(error);
    }
};
