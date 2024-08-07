import { SubOrderModel } from '../models/subOrder.model.js';
import { NotificationModel } from '../models/notification.model.js';

export const updateSubOrderStatus = async (req, res, next) => {
    try {
        const { subOrderId } = req.params;
        const { orderStatus } = req.body;
        const farmerId = req.user.id;

        const subOrder = await SubOrderModel.findOne({ _id: subOrderId, farmer: farmerId });
        if (!subOrder) {
            return res.status(404).json({ message: 'Order not found or you do not have permission to update this order.' });
        }

        subOrder.orderStatus = orderStatus;
        await subOrder.save();

        // Send notification to the customer
        const notification = new NotificationModel({
            user: subOrder.mainOrder.customer,
            type: 'Order Status Update',
            message: `Your order from ${farmerId} has been updated to ${orderStatus}.`,
            isRead: false,
        });
        await notification.save();

        // Emit real-time notification to the customer
        req.app.get('io').to(subOrder.mainOrder.customer.toString()).emit('order-status-updated', notification);

        res.status(200).json({ message: 'Sub-order status updated', subOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update sub-order status' });
    }
};



