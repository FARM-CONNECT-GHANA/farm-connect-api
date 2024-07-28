import { model, Schema, Types } from 'mongoose';
import { toJSON } from '@reis/mongoose-to-json';

const productSchema = new Schema({
    farmer: {type: Types.ObjectId, ref: 'Farmer', required: true},
    name: { 
        en: {type: String, required: true},
        tw: {type: String},
        ee: {type: String},
        ga: {type: String}
    },
    description: { 
        en: {type: String, required: true},
        tw: {type: String},
        ee: {type: String},
        ga: {type: String}
    },
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    category: {type: Types.ObjectId, ref: 'Category', required: true},
    images: [{type: String}]
}, {
    timestamps: true
})

productSchema.plugin(toJSON)

export const ProductModel = model('Product', productSchema)