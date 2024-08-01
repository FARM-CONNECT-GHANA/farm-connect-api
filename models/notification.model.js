import {model, Schema, Types} from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const notificationSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true }, // User who receives the notification
  message: { type: Types.ObjectId, ref: 'Message' }, // Reference to Message (optional)
  notificationContent: { type: String, required: true }, // Content of the notification
  read: { type: Boolean, default: false }, // Read status of the notification
},{
    timestamps: true
});

notificationSchema.plugin(toJSON)

export const Notification = model('Notification', notificationSchema);
