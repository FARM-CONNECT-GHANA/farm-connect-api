import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const cartItemSchema = new Schema({
    customer: { type: Types.ObjectId, ref: 'Customer', required: true },
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  },{
    timestamps: true
  });

  cartItemSchema.plugin(toJSON)
  
  export const CartModel = model('CartItem', cartItemSchema);



