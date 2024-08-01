import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const customerSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true},
    prefferedPaymentMethod: { type: String, enum: ['cash', 'Mobile Money', 'Bank Deposit'], required: true},
    orderHistory: [{type: Types.ObjectId, ref: 'Order'}],
    cart: [{ type: Types.ObjectId, ref: 'CartItem' }]
}, {
    timestamps: true
});

customerSchema.plugin(toJSON)

export const CustomerModel = model('Customer', customerSchema)
