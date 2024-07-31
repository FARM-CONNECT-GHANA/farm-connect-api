import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const orderSchema = new Schema({
    customer: {type: Types.ObjectId, ref: 'Shopper', required: true},
    farmer: {type: Types.ObjectId, ref: 'Farmer', required: true},
    products: [{type: Types.ObjectId, ref: 'OrderItem', required: true}],
    totalAmount: {type: Number, required: true},
    orderStatus: {type: String, enum: ['pending','shipped', 'delivered', 'canceled'], default: 'pending'},
    orderDate: {type: Date, default: Date.now, required: true},
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
})

orderSchema.plugin(toJSON)

export const OrderModel = model('Order', orderSchema)