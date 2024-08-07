import { model, Schema, Types } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const productSchema = new Schema({
    farmer: {type: Types.ObjectId, ref: 'Farmer', required: true},
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    // category: { type: Types.ObjectId, ref: 'Category' },
    category: {type: String, enum: ['Fruits', 'Vegetables', 'Root & Tubers', 'Cereals & Grains', 'Legumes', 'Herbs & Spices', 
        'Nuts & Seeds', 'Animal Products', 'Dairy Products', 'Processed Foods', 'Others'], required: true},
    stock: { type: Number, required: true },
    images: [{type: String}]     
}, {
    timestamps: true
})

productSchema.plugin(toJSON)

export const ProductModel = model('Product', productSchema)