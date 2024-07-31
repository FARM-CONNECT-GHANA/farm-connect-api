import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const orderItemSchema = new Schema({
    order: {type: Types.ObjectId, ref: 'Order', required: true},
    product: {type: Types.ObjectId, ref: 'Product', required: true},
    quantity: {type: Number, required: true},
    price: {type: Number, required: true}
}, {
    timestamps: true
})

orderItemSchema.plugin(toJSON)

export const OrderItemModel = model('OrderItem', orderItemSchema)