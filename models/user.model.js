import { model, Schema } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const userSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, lowercase: true, unique: true, required: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    role: {type: String, enum: ['farmer', 'customer'], required: true},
    location: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
    publicProfile: {
      bio: { type: String },
      profilePicture: { type: String },
      contactNumber: { type: String }
    }
}, {
    timestamps: true
})

userSchema.plugin(toJSON);

userSchema.index({ location: '2dsphere' });
  
export const UserModel = model('User', userSchema);