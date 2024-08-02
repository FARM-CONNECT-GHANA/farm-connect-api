import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const farmerSchema = new Schema({
        user: { type: Types.ObjectId, ref: 'User', required: true },
        farmName: { type: String, required: true },
        farmAddress: { type: String, required: true },
        products: [{ type: Types.ObjectId, ref: 'Product' }],
        farmType: {type: String, enum: ['organic', 'conventional']},
        bankAccountDetails: {type: String}
}, {
    timestamps: true
})

farmerSchema.plugin(toJSON);

export const FarmerModel = model('Farmer', farmerSchema)