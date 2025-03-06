import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import config from './config';
import app from './server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import path from 'path';

// Serve static files for Swagger UI
app.use('/api-docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get(
    '/api-docs',
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Bakery API Documentation',
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js',
        ],
        swaggerOptions: {
            persistAuthorization: true,
        },
    }),
);

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.listen(config.port, () => {
    console.log(`Server running on port http://localhost:${config.port}/`);
});
