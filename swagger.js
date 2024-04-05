/* eslint-disable @typescript-eslint/no-var-requires */
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bakery Ordering System API',
      version: '1.0.0',
      description: 'API documentation for my Bakery system application',
    },
    components: {
      securitySchemes: {
        jwtAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
      }
    },
    security: [
      {
        jwtAuth: [],
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
