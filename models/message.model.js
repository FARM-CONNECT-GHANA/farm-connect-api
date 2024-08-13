import mongoose from "mongoose";
import { model, Schema, Types } from "mongoose";
import autoIncrement from 'mongoose-sequence'; 
import { toJSON } from "@reis/mongoose-to-json";

// Pass mongoose to mongoose-sequence
const AutoIncrement = autoIncrement(mongoose);

export const messageSchema = new Schema ({
    messageId: {type: Number, unique: true},
    sender: {type: Types.ObjectId, ref: 'User', required: true},
    recipient: {type: Types.ObjectId, ref: 'User', required: true},
    messageContent: {type: String, required: true},
    timestamp: {type: Date, default: Date.now, required: true}
}, {
    timestamps: true
})

messageSchema.plugin(toJSON);

// Apply the autoIncrement plugin
messageSchema.plugin(AutoIncrement, { inc_field: 'messageId' });

export const MessageModel = model('Message', messageSchema)