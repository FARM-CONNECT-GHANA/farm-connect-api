import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const orderSchema = new Schema({
    shopper: {type: Types.ObjectId, ref: 'Shopper', required: true},
    farmer: {type: Types.ObjectId, ref: 'Farmer', required: true},
    orderItems: [{type: Types.ObjectId, ref: 'OrderItem', required: true}],
    totalAmount: {type: Number, required: true},
    orderStatus: {type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled']},
    orderDate: {type: Date, default: Date.now, required: true},
    deliveryAddress: {type: String, required: true}
}, {
    timestamps: true
})

orderSchema.plugin(toJSON)

export const OrderModel = model('Order', orderSchema)