import { OrderModel } from '../models/order.model.js';
import { OrderItemModel } from '../models/orderItem.model.js';
import { orderValidator } from '../utils/validation.js';
import { CartModel } from '../models/cart.model.js';
import { NotificationModel } from '../models/notification.model.js';

export const createOrder = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { deliveryAddress } = req.body;

        // Validate order data with Joi
        const { error } = orderValidator.validate({ deliveryAddress });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Retrieve all cart items for the customer
        const cartItems = await CartModel.find({ customer: customerId }).populate('product');

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount and prepare order items
        let totalAmount = 0;
        const orderItems = await Promise.all(
            cartItems.map(async item => {
                const itemTotal = item.product.price * item.quantity;
                totalAmount += itemTotal;

                // Create order item
                const orderItem = new OrderItemModel({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price,
                    order: req.params.orderId,
                });

                await orderItem.save();
                return orderItem._id;
            })
        );

        // Create the order
        const order = new OrderModel({
            customer: customerId,
            farmer: cartItems[0].product.farmer, // Assuming all products are from the same farmer
            products: orderItems,
            totalAmount,
            deliveryAddress,
        });

        await order.save();

        // Clear the cart after the order is created
        await CartModel.deleteMany({ customer: customerId });

        // Emit a real-time notification to the farmer
        const farmerId = cartItems[0].product.farmer;
        req.io.emit('order-placed', {
            message: `A new order has been placed by customer ${customerId}`,
            orderId: order._id,
            farmerId
        });

        // Save the notification in the database
        const notification = new NotificationModel({
            user: farmerId,
            message: `A new order has been placed by customer ${customerId}`,
        });
        await notification.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order' });
        next(error)
    }
};


export const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await OrderModel.findById(id)
            .populate('products') // Populates the OrderItem references
            .populate({
                path: 'products',
                populate: {
                    path: 'product',
                    model: 'Product'
                }
            }) // Populates the product details within each OrderItem
            .populate('customer', 'user.firstName') 
            .populate('farmer', 'farmName'); 

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve order details' });
        next(error)
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const order = await OrderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = orderStatus;
        await order.save();

        // Emit a real-time notification to the customer
        const customerId = order.customer;
        req.io.emit('order-status-updated', {
            message: `Your order status has been updated to ${orderStatus}`,
            orderId: order._id,
            customerId
        });

        // Save the notification in the database
        const notification = new NotificationModel({
            user: customerId,
            message: `Your order status has been updated to ${orderStatus}`,
        });
        await notification.save();

        res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status' });
    }
};



// export const updateOrderStatus = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const { status } = req.body;

//         const order = await OrderModel.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
//         res.status(200).json(order);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to update order status' });
//     }
// };


export const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await OrderModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure that only pending orders can be canceled
        if (order.orderStatus === 'delivered' || order.orderStatus === 'canceled' || order.orderStatus === 'shipped') {
            return res.status(400).json({ message: 'Cannot cancel delivered, shipped or already canceled orders' });
        }

        // Update the order status to canceled
        order.orderStatus = 'canceled';
        await order.save();

        res.status(200).json({ message: 'Order has been canceled', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel order' });
        next(error)
    }
};



