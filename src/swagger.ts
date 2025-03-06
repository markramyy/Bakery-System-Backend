import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bakery Ordering System API',
            version: '1.0.0',
            description: 'API documentation for my Bakery system application',
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? 'https://bakery-system-backend.vercel.app/api'
                        : 'http://localhost:3000/api',
                description: 'API server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
