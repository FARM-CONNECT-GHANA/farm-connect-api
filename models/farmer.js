import { model, Schema, Types } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const farmerSchema = new Schema({
    farmer: { type: Types.ObjectId, ref: 'User', required: true},
    farmName: {type: String, required: true, unique: true},
    farmLocation: { type: { type: String, enum: ['Point'], required: true},
    coordinates: {type: ['Number'], required: true}},
    farmSize: {type: String},
    farmType: {type: String, enum: ['organic', 'conventional']},
    bankAccountDetails: {type: String}
}, {
    timestamps: true
})

farmerSchema.plugin(toJSON);
farmerSchema.index({farmLocation: '2dsphere'});

export const FarmerModel = model('Farmer', farmerSchema)