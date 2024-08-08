import { OrderModel } from '../models/order.model.js';
import { OrderItemModel } from '../models/orderItem.model.js';
import { orderValidator } from '../utils/validation.js';
import { CartModel } from '../models/cart.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { SubOrderModel } from '../models/subOrder.model.js';
import mongoose from 'mongoose';
import { CustomerModel } from '../models/customer.model.js';
import { FarmerModel } from '../models/farmer.model.js';


export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const customerId = req.user?.id; // Ensure req.user and id are present
        if (!customerId) {
            throw new Error('Customer ID is missing.');
        }
        const { deliveryAddress } = req.body;

        // Validate order data with Joi
        const { error } = orderValidator.validate({ deliveryAddress });
        if (error) {
            throw new Error(error.details[0].message); // Throw error to be caught in catch block
        }

        // Retrieve all cart items for the customer
        const cartItems = await CartModel.find({ customer: customerId }).populate('product').session(session);
        if (cartItems.length === 0) {
            throw new Error('Cart is empty'); // Throw error to be caught in catch block
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

                        await orderItem.save({ session }); // Pass session for transaction
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

                await subOrder.save({ session }); // Pass session for transaction
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

        await order.save({ session }); // Pass session for transaction

        // Update the customer's orders
        // await CustomerModel.findByIdAndUpdate(customerId, { $push: { orderHistory: order._id } }, { session });

        // Clear the cart after the order is created
        await CartModel.deleteMany({ customer: customerId }, { session });

        // Send notifications to each farmer
        await Promise.all(subOrders.map(async subOrderId => {
            const subOrder = await SubOrderModel.findById(subOrderId).populate('farmer').session(session);
            if (!subOrder || !subOrder.farmer) {
                console.error(`SubOrder ${subOrderId} has no valid farmer.`);
                return;
            }
            const farmerId = subOrder.farmer._id;

            const notification = new NotificationModel({
                user: farmerId,
                type: 'Order Placement',
                message: `A new order has been placed for your products.`,
                isRead: false,
            });

            await notification.save({ session }); // Pass session for transaction

            // Emit real-time notification to the farmer
            req.app.get('io').to(farmerId.toString()).emit('order-placed', notification);
        }));

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(order);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Failed to create order', error: error.message });
        next(error);
    }
};



export const getCustomerOrderHistory = async (req, res, next) => {
    try {
        const customerId = req.user.id;

        // Find all orders for this customer
        const orders = await OrderModel.find({ customer: customerId })
            .populate({
                path: 'subOrders',
                populate: [
                    {
                        path: 'farmer',
                        select: 'farmName',
                    },
                    {
                        path: 'products',
                        populate: {
                            path: 'product',
                            select: 'name price',
                        }
                    }
                ]
            })
            .exec();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error in getCustomerOrderHistory function:', error);
        res.status(500).json({ message: 'Failed to retrieve order history' });
        next(error);
    }
};




export const trackOrderById = async (req, res, next) => {
    try {
        const { id } = req.params; // Retrieve orderId from request parameters
        const userId = req.user.id; // Assuming req.user.id contains the logged-in user's ID

        // Find the order by its ID and ensure it belongs to the logged-in user
        const order = await OrderModel.findOne({ _id: id, customer: userId })
            .populate({
                path: 'subOrders',
                populate: [
                    {
                        path: 'farmer',
                        select: 'farmName', // Include relevant fields for farmer
                    },
                    {
                        path: 'products',
                        populate: {
                            path: 'product',
                            model: 'Product',
                        }
                    }
                ]
            })
            .populate({
                path: 'customer',
                select: 'firstName lastName' // Include relevant fields for customer
            })
            .exec();

        if (!order) {
            return res.status(404).json({ message: 'Order not found or you are not authorized to view it' });
        }

        // Return order details including its status
        res.status(200).json(order);
    } catch (error) {
        console.error('Error in trackOrderById function:', error);
        res.status(500).json({ message: 'Failed to retrieve order details' });
        next(error);
    }
};


export const getFarmerOrders = async (req, res, next) => {
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

        // Now that you have the farmer's ID, use it to find sub-orders
        const subOrders = await SubOrderModel.find({ farmer: farmer._id })
            .populate({
                path: 'products',
                populate: {
                    path: 'product',
                    select: 'name price'
                }
            })
            .exec();

        if (!subOrders || subOrders.length === 0) {
            return res.status(404).json({ message: 'No sub-orders found for this farmer' });
        }

        // Retrieve orders associated with these sub-orders
        const orderIds = subOrders.map(subOrder => subOrder._id);

        const orders = await OrderModel.find({
            subOrders: { $in: orderIds }
        })
            .populate({
                path: 'subOrders',
                match: { farmer: farmer._id },
                populate: {
                    path: 'products',
                    populate: {
                        path: 'product',
                        select: 'name price'
                    }
                }
            })
            .exec();

        // Check if orders are found
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this farmer' });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error in getFarmerOrders function:', error);
        res.status(500).json({ message: 'Failed to retrieve farmer orders' });
        next(error);
    }
};





export const cancelOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const orderId = req.params.id;
        const customerId = req.user.id; // Assuming `req.user.id` is the ID of the logged-in customer

        // Find and populate the order
        const order = await OrderModel.findById(orderId)
            .populate({
                path: 'subOrders',
                populate: {
                    path: 'farmer',
                    select: '_id',
                }
            })
            .session(session)
            .exec();

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order belongs to the logged-in customer
        if (order.customer.toString() !== customerId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You are not authorized to cancel this order' });
        }

        // Only allow cancellation if the order is still pending
        if (order.subOrders.every(subOrder => subOrder.orderStatus !== 'pending')) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Order cannot be canceled' });
        }

        // Cancel each sub-order and notify farmers
        await Promise.all(
            order.subOrders.map(async subOrder => {
                // Check if the subOrder has a valid farmer before proceeding
                if (!subOrder.farmer || !subOrder.farmer._id) {
                    console.warn('SubOrder does not have a valid farmer:', subOrder);
                    return; // Skip this subOrder if farmer is missing
                }

                subOrder.orderStatus = 'canceled';
                await subOrder.save({ session });

                // Send cancellation notification to each farmer
                const farmerId = subOrder.farmer._id.toString(); // Ensure farmerId is a string

                const notification = new NotificationModel({
                    user: farmerId,
                    type: 'Order Canceled',
                    message: `An order has been canceled by the customer.`,
                    isRead: false,
                });

                await notification.save({ session });

                // Emit notification to the farmer via Socket.IO
                const io = req.app.get('io');
                if (io) {
                    io.to(farmerId).emit('order-canceled', notification);
                } else {
                    console.warn('Socket.IO instance not found');
                }
            })
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Order canceled', order });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in cancelOrder function:', error);
        res.status(500).json({ message: 'Failed to cancel order' });
        next(error);
    }
};








