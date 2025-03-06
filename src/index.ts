import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import config from './config';
import app from './server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import path from 'path';

// Serve Swagger UI static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js',
        ],
    }),
);

app.listen(config.port, () => {
    console.log(`Server on http://localhost:${config.port}/api-docs`);
});
