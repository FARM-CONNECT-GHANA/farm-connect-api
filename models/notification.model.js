import {model, Schema, Types} from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const notificationSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true }, // User who receives the notification
  type: { type: String, enum: ['Order Placement', 'Order Status Update', 'Order Canceled', 'Message'], required: true }, // Type of notification
  message: { type: String, required: true }, // Content of the notification
  isRead: { type: Boolean, default: false }
},{
    timestamps: true
});

notificationSchema.plugin(toJSON)

export const NotificationModel = model('Notification', notificationSchema);
