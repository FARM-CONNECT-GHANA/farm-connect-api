import { MessageModel } from '../models/message.model.js';
import { messageValidator } from '../utils/validation.js';

export const sendMessage = async (req, res, next) => {
    try {
        // Validate request data with Joi
        const { error } = messageValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { sender, recipient, messageContent } = req.body;

        // Create a new message
        const message = new MessageModel({
            sender,
            recipient,
            messageContent,
            readStatus: false, // Default value
            timestamp: new Date() // Use current timestamp
        });

        await message.save();

        // Send real-time notification using Socket.IO
        req.app.get('io').to(recipient.toString()).emit('receive-message', message);

        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        next(error);
    }
};


export const getMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Fetch messages for the user
        const messages = await MessageModel.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ timestamp: -1 });

        res.status(200).json({ messages });
    } catch (error) {
        next(error);
    }
};


export const updateMessageStatus = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { readStatus } = req.body;

        // Validate request data
        if (typeof readStatus !== 'boolean') {
            return res.status(400).json({ message: 'Invalid read status' });
        }

        // Update message status
        const message = await MessageModel.findByIdAndUpdate(
            messageId,
            { readStatus },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message status updated', data: message });
    } catch (error) {
        next(error);
    }
};

