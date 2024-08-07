import { FeedbackModel } from '../models/feedback.model.js';
import { feedbackValidator } from '../utils/validation.js';
import transporter from '../config/email.js';

export const submitFeedback = async (req, res, next) => {
    try {
        // Validate feedback data
        const { error } = feedbackValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Create feedback
        const feedback = new FeedbackModel({
            user: req.user.id,
            subject: req.body.subject,
            message: req.body.message,
        });

        await feedback.save();

        // Send email to admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, 
            subject: `New Feedback Received: ${feedback.subject}`,
            text: `You have received new feedback from user ${req.user.id}.\n\nMessage:\n${feedback.message}`,
        };

        await transporter.sendMail(adminMailOptions);

        // Send confirmation email to the user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: req.user.email, // Sender's email
            subject: 'Feedback Received',
            text: `Thank you for your feedback!\n\nSubject: ${feedback.subject}\nMessage: ${feedback.message}`,
        };

        await transporter.sendMail(userMailOptions);

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit feedback' });
        next(error);
    }
};
