import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const orderSchema = new Schema({
    customer: { type: Types.ObjectId, ref: 'User', required: true },
    subOrders: [{ type: Types.ObjectId, ref: 'SubOrder' }],
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        country: { type: String, required: true },
        postalCode: { type: String, required: true }
    },
}, {
    timestamps: true
});


orderSchema.plugin(toJSON)

export const OrderModel = model('Order', orderSchema)