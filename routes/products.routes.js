import { Router } from "express";
import { authenticated, authorized } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import { remoteUpload } from "../middlewares/upload.js";

const productRoutes = Router();

productRoutes.post('/products', remoteUpload.array('images', 6), authenticated, authorized(['farmer']), createProduct)

productRoutes.get('/products', getAllProducts)

productRoutes.get('/products/:id', getProductById)

productRoutes.patch('/products/:id', remoteUpload.array('images', 6), authenticated, authorized(['farmer']), updateProduct)

productRoutes.delete('/products/:id', authenticated, authorized(['farmer']), deleteProduct)

export default productRoutes;