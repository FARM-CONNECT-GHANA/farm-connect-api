import { NotificationModel } from "../models/notification.model.js";

export const markNotificationAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await NotificationModel.findById(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if the user is the owner of the notification
        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the notification's isRead status
        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark notification as read' });
        next(error)
    }
};
