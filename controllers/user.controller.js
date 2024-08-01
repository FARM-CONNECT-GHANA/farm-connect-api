import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginValidator, registerValidator } from '../utils/validation.js';
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
      const { value, error } = loginValidator.validate(req.body);
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

// Function to get farmer profile
export const getFarmerProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        // Find the farmer document associated with the user
        const farmer = await FarmerModel.findOne({ user: userId })
            .populate('user', 'firstName lastName email phone location publicProfile') // Populate user details
            .populate('products') // Populate related products

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }

        res.status(200).json(farmer);
    } catch (error) {
        next(error);
    }
};

// Function to enable customers view farmer profile
export const getFarmerDetails = async (req, res, next) => {
  try {
    const { id } = req.params; 
    
    // Fetch the farmer profile
    const farmer = await FarmerModel.findById(id)
      .populate('user', 'firstName lastName email phone location publicProfile') // Populate user details
      .populate('products'); // Populate products details
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    // Return the farmer details
    res.status(200).json(farmer);
  } catch (error) {
    next(error);
  }
};

// function to get customer profile
export const getCustomerProfile = async (req, res, next) => {
    try {

        const userId = req.user.id; 

        // Fetch the customer's profile using the user ID
        const customer = await CustomerModel.findOne({ user: userId })
            .populate('user', 'firstName lastName email phone location publicProfile') // Populate user details
            .populate('cart') // Optional: Populate cart items 
            .populate('orderHistory') // Optional: Populate order history 
    
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
