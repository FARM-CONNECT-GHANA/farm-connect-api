import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { customerValidator, loginValidator, registerValidator } from '../utils/validation.js';
import { UserModel } from '../models/user.model.js';
import { FarmerModel } from '../models/farmer.model.js';
import { CustomerModel } from '../models/customer.model.js';

// Registration function
export const register = async (req, res, next) => {
    try {
        // Validate request
        const { value, error } = registerValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }
        // Encrypt user password
        const hashedPassword = bcrypt.hashSync(value.password, 12);
        // Create user
        await UserModel.create({
            ...value,
            password: hashedPassword
        });
        // Return response
        res.status(201).json('User Registration successful');
    } catch (error) {
        next(error);
    }
}

// Login with token function
export const tokenLogin = async (req, res, next) => {
    try {
      // Validate request
      const { error } = loginValidator.validate(req.body);
      if (error) {
        return res.status(422).json({ message: error.details[0].message });
      }
  
      const { email, password } = req.body;
  
      // Find a user by their email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'User does not exist' });
      }
  
      // Verify user password
      const correctPassword = bcrypt.compareSync(password, user.password);
      if (!correctPassword) {
        return res.status(401).json({ message: 'Incorrect username or password' });
      }
  
      // Create token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
      // Return response
      res.status(200).json({
        message: 'Login successful',
        accessToken: token
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
      next(error);
    }
  };

// function to create farmer profile
export const createFarmerProfile = async (req, res, next) => {
    try {
        const user = req.user.id; // Get the user ID from req.user
        const { farmName, farmAddress, products, farmType, bankAccountDetails, about } = req.body;

        // Validate the input using Joi
        const { error } = farmerValidator.validate({ farmName, farmAddress, farmType, bankAccountDetails, about });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Validate that the user exists
        const userExists = await UserModel.findById(user);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new farmer profile
        const newFarmer = await FarmerModel.create({
            user,
            farmName,
            farmAddress,
            products,
            farmType,
            bankAccountDetails,
            about,
            farmPhotos: req.files?.filename
        });

        res.status(201).json({ 
            message: 'Profile created',
            newFarmer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the farmer profile' });
        next(error);
    }
};

// function to get farmer profile
export const getFarmerProfile = async (req, res, next) => {
    try {
        const { id } = req.params; // ID from request parameters (for customer view)
        const userId = req.user.id; // ID of the logged-in user (for farmer's own view)

        let farmer;

        if (id) {
            // If ID is provided in the request params, customer is viewing the farmer's profile
            farmer = await FarmerModel.findById(id)
                .populate('user', 'firstName lastName email phone location')
                .populate('products');
        } else {
            // If no ID is provided, the farmer is viewing their own profile
            farmer = await FarmerModel.findOne({ user: userId })
                .populate('user')
                .populate('products');
        }

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }

        res.status(200).json(farmer);
    } catch (error) {
        next(error);
    }
};

// function to update farmer profile
export const updateFarmerProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get the user ID from req.user
        const { farmName, farmAddress, products, farmType, bankAccountDetails, about } = req.body;

        // Validate the input using Joi
        const { error } = farmerValidator.validate({ farmName, farmAddress, farmType, bankAccountDetails, about });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the farmer profile exists for this user
        const farmerExists = await FarmerModel.findOne({ user: userId });
        if (!farmerExists) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }

        // Prepare the update object
        const updateData = {
            farmName,
            farmAddress,
            products,
            farmType,
            bankAccountDetails,
            about,
            farmPhotos: req.files?.filename
        };

        // Update the farmer profile
        const updatedFarmer = await FarmerModel.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, runValidators: true } // Returns the updated document and applies schema validators
        );

        res.status(200).json({ message: 'Update successful', updatedFarmer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the farmer profile' });
        next(error);
    }
};

// function to create customer profile
export const createCustomerProfile = async (req, res, next) => {
    try {
        const user = req.user.id; // Get the user ID from req.user
        const { preferredPaymentMethod, orderHistory, cart } = req.body;

        // Validate the input using Joi
        const { error } = customerValidator.validate({ preferredPaymentMethod });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Validate that the user exists (though typically, if you have req.user, the user is already authenticated)
        const userExists = await UserModel.findById(user);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a new customer profile
        const newCustomer = await CustomerModel.create({
            user,
            preferredPaymentMethod,
            orderHistory,
            cart
        });

        res.status(201).json(newCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the customer profile' });
        next(error);
    }
};

// function to get customer profile
export const getCustomerProfile = async (req, res, next) => {
    try {

        const userId = req.user.id; 

        // Fetch the customer's profile using the user ID
        const customer = await CustomerModel.findOne({ user: userId })
            .populate('user') // Populate user details
            .populate('cart') // Populate cart items 
            .populate('orderHistory') // Populate order history 
    
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        // Return the customer's profile
        res.status(200).json(customer);
    } catch (error) {
        // Handle any errors that occur
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the profile' });
        next(error);
    }
};

// function to update customer profile
export const updateCustomerProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // Get the user ID from req.user
        const { preferredPaymentMethod, orderHistory, cart } = req.body;

        // Validate the input using Joi
        const { error } = customerValidator.validate({ preferredPaymentMethod });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the customer profile exists for this user
        const customerExists = await CustomerModel.findOne({ user: userId });
        if (!customerExists) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        // Prepare the update object
        const updateData = {
            preferredPaymentMethod,
            orderHistory,
            cart
        };

        // Update the customer profile
        const updatedCustomer = await CustomerModel.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, runValidators: true } // Returns the updated document and applies schema validators
        );

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the customer profile' });
        next(error);
    }
};