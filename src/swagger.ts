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
                        ? 'https://bakery-system-backend.vercel.app/api'
                        : 'http://localhost:3001/api',
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
    apis: [
        join(__dirname, 'routes', '*.ts'),
        join(__dirname, 'routes', '*.js'),
        join(__dirname, 'handlers', '*.ts'),
        join(__dirname, 'handlers', '*.js'),
    ],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
