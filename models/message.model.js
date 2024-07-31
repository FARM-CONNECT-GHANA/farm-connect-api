import { model, Schema, Types } from "mongoose";
import autoIncrement from 'mongoose-sequence'; 
import { toJSON } from "@reis/mongoose-to-json";

export const messageSchema = new Schema ({
    messageId: {type: Number, required: true, unique: true},
    sender: {type: Types.ObjectId, ref: 'User', required: true},
    recipient: {type: Types.ObjectId, ref: 'User', required: true},
    messageContent: {type: String},
    readStatus: {type: Boolean, default: false},
    messageType: {type: String, enum: ['text', 'image', 'file'], required: true},
    timestamp: {type: Date, default: Date.now, required: true}
}, {
    timestamps: true
})

messageSchema.plugin(toJSON, autoIncrement, {inc_field: 'messageId'});

export const MessageModel = model('Message', messageSchema)