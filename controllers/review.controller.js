import { ReviewModel } from '../models/review.model.js';
import { reviewValidator } from '../utils/validation.js';
import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model.js';
import { FarmerModel } from '../models/farmer.model.js';
import { CustomerModel } from '../models/customer.model.js';

export const createReview = async (req, res, next) => {
  try {
    // Validate the incoming request data
    const { targetType, targetId, rating, comment } = req.body;

    // Validate targetType
    if (!['product', 'farmer', 'customer'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    // Validate targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid targetId' });
    }

    // Check if the target entity exists
    let targetEntity;
    if (targetType === 'product') {
      targetEntity = await ProductModel.findById(id);
    } else if (targetType === 'farmer') {
      targetEntity = await FarmerModel.findById(id);
    } else if (targetType === 'customer') {
      targetEntity = await CustomerModel.findById(id);
    }

    if (!targetEntity) {
      return res.status(404).json({ message: 'Target entity not found' });
    }

    // Check if the user is authorized to review
    const reviewer = req.user._id;

    // Create and save the review
    const newReview = new ReviewModel({
      reviewer,
      targetType,
      targetId,
      rating,
      comment
    });

    const savedReview = await newReview.save();

    res.status(201).json({ message: 'Review created successfully', review: savedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    next(error);
  }
};


export const getReviews = async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
  
      // Validate targetType
      if (!['product', 'farmer', 'customer'].includes(targetType)) {
        return res.status(400).json({ message: 'Invalid targetType' });
      }
  
      // Validate targetId
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: 'Invalid targetId' });
      }
  
      // Fetch reviews
      const reviews = await ReviewModel.find({ targetType, targetId }).populate('reviewer', 'user.firstName');
  
      res.status(200).json({ message: 'Reviews retrieved successfully', reviews });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
      next(error);
    }
  };
  

// Update a review (only the reviewer can do this)
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the review
    const review = await ReviewModel.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is authorized to update the review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    // Validate the incoming request data using Joi
    const { error } = reviewValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Update the review
    const updatedReview = await ReviewModel.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    next(error)
  }
};

// Delete a review (only the reviewer can do this)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the review
    const review = await ReviewModel.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is authorized to delete the review
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    // Delete the review
    await ReviewModel.findByIdAndDelete(id);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    next(error);
  }
};
