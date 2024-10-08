import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'farm-connect-api',
    version: '1.0.0',
    description: 'API documentation for FarmConnect app',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8090}`,
      description: 'Local API server',
    },
    {
      url: process.env.RENDER_URL,
      description: 'Production API server',
    },
  ],  
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Swagger options
const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/user.routes.js', // Path to user routes file
    './routes/products.routes.js', // Path to product routes file
    './routes/cart.routes.js', // Path to cart routes file
    './routes/order.routes.js', // Path to order routes file
    './routes/subOrder.routes.js', // Path to suborder routes file
    './routes/messages.routes.js', // Path to message routes file
    './routes/feedback.routes.js' // Path to feedback routes file
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Export Swagger UI setup
export const swaggerDocs = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
