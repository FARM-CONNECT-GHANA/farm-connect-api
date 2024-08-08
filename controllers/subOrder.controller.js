import { SubOrderModel } from '../models/subOrder.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { FarmerModel } from '../models/farmer.model.js';
import { OrderModel } from '../models/order.model.js';


export const updateSubOrderStatus = async (req, res, next) => {
    try {
        const { subOrderId } = req.params;
        const { orderStatus } = req.body;
        const userId = req.user.id;  // Get the user ID from the request

        // Find the farmer associated with the user
        const farmer = await FarmerModel.findOne({ user: userId });
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found for this user.' });
        }

        const farmerId = farmer._id;  // Get the farmer's ID

        // Find the sub-order by subOrderId and check if it belongs to the farmer
        const subOrder = await SubOrderModel.findOne({ _id: subOrderId, farmer: farmerId });
        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to update this order.' });
        }

        // Find the order associated with the sub-order
        const order = await OrderModel.findOne({ subOrders: subOrderId }).populate('customer');
        if (!order || !order.customer) {
            return res.status(404).json({ message: 'Order or customer information is missing.' });
        }

        // Update the order status
        subOrder.orderStatus = orderStatus;
        await subOrder.save();

        // Send notification to the customer
        const notification = new NotificationModel({
            user: order.customer._id,
            type: 'Order Status Update',
            message: `Your order from ${farmerId} has been updated to ${orderStatus}.`,
            isRead: false,
        });
        await notification.save();

        // Emit real-time notification to the customer
        req.app.get('io').to(order.customer._id.toString()).emit('order-status-updated', notification);

        res.status(200).json({ message: 'Sub-order status updated', subOrder });
    } catch (error) {
        console.error('Error updating sub-order status:', error);  // Log the error for debugging
        res.status(500).json({ message: 'Failed to update sub-order status' });
    }
};

             




