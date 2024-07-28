import { model, Schema } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const userSchema = new Schema({
    firstName: {type: String, required: true},
    last_Name: {type: String, required: true},
    email: {type: String, lowercase: true, unique: true, required: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    userType: {type: String, enum: ['farmer', 'shopper']},
    language: {type: String, enum: ['en', 'tw', 'ee', 'ga'], default: 'en'}
}, {
    timestamps: true
})

userSchema.plugin(toJSON);

export const UserModel = model('User', userSchema)