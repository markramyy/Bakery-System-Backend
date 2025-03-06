import * as dotenv from 'dotenv';
dotenv.config();

import config from './config';
import app from './server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get(
    '/api-docs',
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Bakery API Documentation',
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
