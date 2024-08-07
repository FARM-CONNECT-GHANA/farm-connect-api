import { OrderModel } from '../models/order.model.js';
import { OrderItemModel } from '../models/orderItem.model.js';
import { orderValidator } from '../utils/validation.js';
import { CartModel } from '../models/cart.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { SubOrderModel } from '../models/subOrder.model.js';
import mongoose from 'mongoose';
import { CustomerModel } from '../models/customer.model.js';

export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const customerId = req.user.id; // Assuming req.user contains the logged-in user's details
        const { deliveryAddress } = req.body;

        // Validate order data with Joi
        const { error } = orderValidator.validate({ deliveryAddress });
        if (error) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: error.details[0].message });
        }

        // Retrieve all cart items for the customer
        const cartItems = await CartModel.find({ customer: customerId }).populate('product');
        if (cartItems.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Group items by farmer
        const itemsByFarmer = {};
        cartItems.forEach(item => {
            const farmerId = item.product.farmer.toString();
            if (!itemsByFarmer[farmerId]) {
                itemsByFarmer[farmerId] = [];
            }
            itemsByFarmer[farmerId].push(item);
        });

        // Create sub-orders for each farmer
        let totalAmount = 0;
        const subOrders = await Promise.all(
            Object.keys(itemsByFarmer).map(async farmerId => {
                let subTotal = 0;
                const orderItems = await Promise.all(
                    itemsByFarmer[farmerId].map(async item => {
                        const itemTotal = item.product.price * item.quantity;
                        subTotal += itemTotal;

                        const orderItem = new OrderItemModel({
                            product: item.product._id,
                            quantity: item.quantity,
                            price: item.product.price,
                        });

                        await orderItem.save();
                        return orderItem._id;
                    })
                );

                totalAmount += subTotal;

                const subOrder = new SubOrderModel({
                    farmer: farmerId,
                    products: orderItems,
                    totalAmount: subTotal,
                    orderStatus: 'pending',
                });

                await subOrder.save();
                return subOrder._id;
            })
        );

        // Create the main order
        const order = new OrderModel({
            customer: customerId,
            subOrders,
            totalAmount,
            deliveryAddress,
        });

        await order.save();

        // Update the customer's orders
        await CustomerModel.findByIdAndUpdate(customerId, { $push: { orders: order._id } });

        // Clear the cart after the order is created
        await CartModel.deleteMany({ customer: customerId });

        // Send notifications to each farmer
        await Promise.all(subOrders.map(async subOrderId => {
            const subOrder = await SubOrderModel.findById(subOrderId).populate('farmer');
            const farmerId = subOrder.farmer._id;
            
            const notification = new NotificationModel({
                user: farmerId,
                type: 'Order Placement',
                message: `A new order has been placed for your products.`,
                isRead: false,
            });

            await notification.save();

            // Emit real-time notification to the farmer
            req.app.get('io').to(farmerId.toString()).emit('order-placed', notification);
        }));

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(order);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Failed to create order' });
        next(error);
    }
};


export const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the main order by its ID
        const order = await OrderModel.findById(id)
            .populate({
                path: 'subOrders', // Populates subOrders references
                populate: [
                    {
                        path: 'farmer', // Populates farmer details within each subOrder
                        select: 'farmName',
                    },
                    {
                        path: 'products', // Populates OrderItems references
                        populate: {
                            path: 'product', // Populates product details within each OrderItem
                            model: 'Product',
                        }
                    }
                ]
            })
            .populate({
                path: 'customer',          
                select: 'firstName lastName'
            })
            .exec();

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve order details' });
        next(error);
    }
};


export const getFarmerOrders = async (req, res, next) => {
    try {
        const farmerId = req.user.id; // Assuming `req.user.id` is the ID of the logged-in farmer

        // Check if the farmerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ message: 'Invalid farmer ID' });
        }

        // Find sub-orders for the farmer
        const subOrders = await SubOrderModel.find({ farmer: farmerId })
            .populate({
                path: 'products',
                populate: {
                    path: 'product', // Assuming each product is referenced in the sub-order
                    select: 'name price'
                }
            })
            .exec();

        if (!subOrders || subOrders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this farmer' });
        }

        // Retrieve orders associated with these sub-orders
        const orderIds = subOrders.map(subOrder => subOrder._id);
        const orders = await OrderModel.find({ subOrders: { $in: orderIds } })
            .populate({
                path: 'subOrders',
                match: { farmer: farmerId },
                populate: {
                    path: 'products',
                    populate: {
                        path: 'product',
                        select: 'name price'
                    }
                }
            })
            .exec();

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve farmer orders' });
        next(error);
    }
};



export const cancelOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;

        const order = await OrderModel.findById(orderId)
            .populate({
                path: 'subOrders',
                populate: {
                    path: 'farmer',
                    select: '_id', // You might want to adjust the fields based on your schema
                }
            })
            .exec();

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow cancellation if the order is still pending
        if (order.subOrders.every(subOrder => subOrder.orderStatus !== 'pending')) {
            return res.status(400).json({ message: 'Order cannot be canceled' });
        }

        // Cancel each sub-order and notify farmers
        await Promise.all(
            order.subOrders.map(async subOrder => {
                // Ensure subOrder.farmer is populated
                if (!subOrder.farmer) {
                    console.warn('SubOrder does not have a valid farmer:', subOrder);
                    return; // Skip this subOrder if farmer is missing
                }

                subOrder.orderStatus = 'canceled';
                await subOrder.save();

                // Send cancellation notification to each farmer
                const notification = new NotificationModel({
                    user: subOrder.farmer._id, // Use ._id to reference the user
                    type: 'Order Canceled',
                    message: `An order has been canceled by the customer.`,
                    isRead: false,
                });

                await notification.save();
                req.app.get('io').to(subOrder.farmer._id.toString()).emit('order-canceled', notification);
            })
        );

        res.status(200).json({ message: 'Order canceled', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel order' });
        next(error);
    }
};




