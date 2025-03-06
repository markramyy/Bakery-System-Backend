import * as dotenv from 'dotenv';
dotenv.config();

import config from './config';
import app from './server';
import { setupSwagger } from './modules/middleware';

// Setup Swagger
setupSwagger(app);

app.listen(config.port, () => {
    console.log(`Server running on port http://localhost:${config.port}/`);
    console.log(`Swagger docs available at http://localhost:${config.port}/api-docs`);
});
