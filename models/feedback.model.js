import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const feedbackSchema = new Schema({
    user: {type: Types.ObjectId, ref: 'User', required: true},
    message: { type: String, required: true}
}, {
    timestamps: true
})

feedbackSchema.plugin(toJSON)

export const FeedbackModel = model('Feedback', feedbackSchema)