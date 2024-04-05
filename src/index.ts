/* eslint-disable @typescript-eslint/no-var-requires */
import * as dotenv from 'dotenv'
dotenv.config()

import config from './config'
import app from './server'

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger.js');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(config.port, () => {
	console.log(`Server on http://localhost:${config.port}/api-docs`)
})
