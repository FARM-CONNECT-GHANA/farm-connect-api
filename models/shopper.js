import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const shopperSchema = new Schema({
    shopper: { type: Types.ObjectId, ref: 'User', required: true},
    prefferedPaymentMethod: { type: String, enum: ['cash', 'Mobile Money', 'Bank Deposit'], required: true},
    orderHistory: [{type: Types.ObjectId, ref: 'Order'}]
}, {
    timestamps: true
});

shopperSchema.plugin(toJSON)

export const ShopperModel = model('Shopper', shopperSchema)
