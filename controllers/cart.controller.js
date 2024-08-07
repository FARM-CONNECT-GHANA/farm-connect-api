import { CartModel } from '../models/cart.model.js';
import { cartValidator } from '../utils/validation.js';

export const addItemToCart = async (req, res, next) => {
    try {
        const { product, quantity } = req.body;

        // Ensure quantity is a number (no validation needed for positive/negative as long as it's a number)
        if (typeof quantity !== 'number') {
            return res.status(400).json({ message: 'Quantity must be a number' });
        }

        const customerId = req.user.id;
        let cartItem = await CartModel.findOne({ customer: customerId, product });

        if (cartItem) {
            // Increase or decrease the quantity based on the sign of quantity
            cartItem.quantity += quantity;

            // Remove the item if the quantity becomes zero or less
            if (cartItem.quantity <= 0) {
                await cartItem.remove();
                return res.status(200).json({ message: 'Item removed from cart' });
            } else {
                await cartItem.save();
                return res.status(200).json(cartItem);
            }
        } else {
            // If item doesn't exist in the cart
            if (quantity > 0) {
                // Create a new cart item if quantity is positive
                const newCartItem = new CartModel({
                    customer: customerId,
                    product,
                    quantity
                });

                await newCartItem.save();
                return res.status(201).json(newCartItem);
            } else {
                // Respond with an error if trying to add an item with zero or negative quantity
                return res.status(400).json({ message: 'Cannot add item with zero or negative quantity' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update item in cart' });
        next(error);
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


