import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const reviewSchema = new Schema({
    reviewer: { type: Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['product', 'farmer', 'customer'], required: true },
    targetId: { type: Types.ObjectId, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
  },{
    timestamps: true
  });
  
  reviewSchema.plugin(toJSON)
  
  export const ReviewModel = model('Review', reviewSchema);
