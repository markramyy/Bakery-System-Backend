import swaggerJSDoc from 'swagger-jsdoc';
import { join } from 'path';

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
                        ? 'https://bakery-system-backend.vercel.app'
                        : 'http://localhost:3001',
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
        security: [{ bearerAuth: [] }],
    },
    apis: [join(__dirname, 'routes/*.ts')],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
