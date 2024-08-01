import Joi from "joi";

export const registerValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    role: Joi.string().valid('farmer', 'customer'),
});

export const loginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const userValidator = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    role: Joi.string().required().valid('farmer', 'customer'),
});

export const  reviewValidator = Joi.object({
    targetType: Joi.string().required().valid('product', 'farmer'),
    rating: Joi.number().required().min(1).max(5)
})

export const productValidator = Joi.object({
    name:Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),  
})

export const orderItemValidator = Joi.object({
    price: Joi.number().required(),
    quantity: Joi.number().required(), 
})

export const orderValidator = Joi.object({
    totalAmount: Joi.number().required(), 
    orderStatus: Joi.string().valid('pending','shipped', 'delivered', 'canceled').default('pending'),
    deliveryAddress: Joi.object({
        addressLine1: Joi.string()
          .required()
          .messages({
            'string.base': 'Address Line 1 must be a string',
            'any.required': 'Address Line 1 is required'
          }),
      
        addressLine2: Joi.string()
          .optional()
          .allow(''), // Allow empty string if not provided
      
        city: Joi.string()
          .required()
          .messages({
            'string.base': 'City must be a string',
            'any.required': 'City is required'
          }),
      
        state: Joi.string()
          .optional()
          .allow(''), // Allow empty string if not provided
      
        country: Joi.string()
          .required()
          .messages({
            'string.base': 'Country must be a string',
            'any.required': 'Country is required'
          }),
      
        postalCode: Joi.string()
          .required()
          .messages({
            'string.base': 'Postal Code must be a string',
            'any.required': 'Postal Code is required'
          })
      })
})

export const notificationValidator = Joi.object({
    notificationContent: Joi.string()
      .required()
      .messages({
        'string.base': 'Notification content must be a string',
        'any.required': 'Notification content is required'
      }),
  
    read: Joi.boolean()
      .default(false)  // Defaults to false if not provided
      .messages({
        'boolean.base': 'Read status must be a boolean'
      })
  });

  export const messageValidator = Joi.object({
    messageContent: Joi.string()
      .optional()
      .messages({
        'string.base': 'Message content must be a string'
      }),
  
    readStatus: Joi.boolean()
      .default(false)
      .messages({
        'boolean.base': 'Read status must be a boolean'
      }),
  
    messageType: Joi.string()
      .valid('text', 'image', 'file')
      .required()
      .messages({
        'string.base': 'Message type must be a string',
        'any.only': 'Message type must be one of text, image, file',
        'any.required': 'Message type is required'
      })
  });

  export const feedbackValidator = Joi.object({
    subject: Joi.string()
      .required()
      .messages({
        'string.base': 'Subject must be a string',
        'any.required': 'Subject is required'
      }),
  
    message: Joi.string()
      .required()
      .messages({
        'string.base': 'Message must be a string',
        'any.required': 'Message is required'
      })
  });

  export const farmerValidator = Joi.object({
    farmName: Joi.string()
      .required()
      .messages({
        'string.base': 'Farm name must be a string',
        'any.required': 'Farm name is required'
      }),
  
    farmAddress: Joi.string()
      .required()
      .messages({
        'string.base': 'Farm address must be a string',
        'any.required': 'Farm address is required'
      }),
  
    farmType: Joi.string()
      .valid('organic', 'conventional')
      .optional()
      .messages({
        'string.base': 'Farm type must be a string',
        'any.only': 'Farm type must be one of [organic, conventional]'
      }),
  
    bankAccountDetails: Joi.string()
      .optional()
      .messages({
        'string.base': 'Bank account details must be a string'
      })
  });

  export const customerValidator = Joi.object({
        preferredPaymentMethod: Joi.string()
          .valid('cash', 'Mobile Money', 'Bank Deposit')
          .required()
          .messages({
            'string.base': 'Preferred payment method must be a string',
            'any.only': 'Preferred payment method must be one of [cash, Mobile Money, Bank Deposit]',
            'any.required': 'Preferred payment method is required'
          })
  })

  export const cartValidator = Joi.object({
    quantity: Joi.number()
      .integer()  // Ensures the value is an integer
      .min(1)     // Optional: ensures the quantity is at least 1; adjust as needed
      .required() // Indicates that this field must be present
      .messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1', // Customize based on your requirements
        'any.required': 'Quantity is required'
      })
  });