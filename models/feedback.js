import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const feedbackSchema = new Schema({
    user: {type: Types.ObjectId, ref: 'User', required: true},
    feedbackText: { type: String, required: true},
    status: {type: String, enum: ['pending', 'sent', 'resolved', 'failed']},
    ticketId: {type: String, default: null}
}, {
    timestamps: true
})

feedbackSchema.plugin(toJSON)

export const FeedbackModel = model('Feedback', feedbackSchema)