import { CartModel } from '../models/cart.model.js';
import { cartValidator } from '../utils/validation.js';

export const addItemToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        // Validate request data with Joi
        const { error } = cartValidator.validate({ quantity });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const customerId = req.user.id;
        let cartItem = await CartModel.findOne({ customer: customerId, product: productId });

        if (cartItem) {
            // If the product is already in the cart, update the quantity
            cartItem.quantity += quantity;
        } else {
            // Otherwise, create a new cart item
            cartItem = new CartModel({
                customer: customerId,
                product: productId,
                quantity
            });
        }

        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add item to cart' });
        next(error)
    }
};


export const removeItemFromCart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cartItem = await CartModel.findByIdAndDelete(id);

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove item from cart' });
        next(error)
    }
};


export const getCartItems = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const cartItems = await CartModel.find({ customer: customerId })
            .populate('product', 'name price'); 

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve cart items' });
        next(error)
    }
};


