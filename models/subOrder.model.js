import { model, Schema, Types } from "mongoose";

const subOrderSchema = new Schema({
    farmer: { type: Types.ObjectId, ref: 'Farmer', required: true },
    products: [{ type: Types.ObjectId, ref: 'OrderItem', required: true }],
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled'], default: 'pending' }
}, {
    timestamps: true
});

export const SubOrderModel = model('SubOrder', subOrderSchema);
