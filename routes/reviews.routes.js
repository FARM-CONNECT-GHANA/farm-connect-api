import { Router } from "express";
import { authenticated } from "../middlewares/auth.middleware.js";
import { createReview, deleteReview, getReviews, updateReview } from "../controllers/review.controller.js";

const reviewRoutes = Router();

reviewRoutes.post('/reviews', authenticated, createReview);

reviewRoutes.get('/reviews/:targetType/:targetId', getReviews);

reviewRoutes.patch('/reviews/:id', authenticated, updateReview);

reviewRoutes.delete('/reviews/:id', authenticated, deleteReview);

export default reviewRoutes;