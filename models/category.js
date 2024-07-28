import { model, Schema } from "mongoose";
import { toJSON } from "@reis/mongoose-to-json";

const categorySchema = new Schema ({
    name: { 
        en: {type: String, required: true},
        tw: {type: String},
        ee: {type: String},
        ga: {type: String}
    },
    description: { 
        en: {type: String},
        tw: {type: String},
        ee: {type: String},
        ga: {type: String}
    },
}, {
    timestamps: true
})

categorySchema.plugin(toJSON)

export const CategoryModel = model('Category', categorySchema)