import { Router } from "express";
import { register, tokenLogin } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post('/register', register)

userRoutes.post('/login', tokenLogin)

export default userRoutes