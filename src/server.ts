import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';

import { protect } from './modules/auth';

import swaggerRouter from './routes/swagger';
import usersRouter from './routes/users';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import authRouter from './routes/auth';

const app = express();

// Third-party middleware
app.use(cors()); // allows for cross-origin requests
app.use(morgan('dev')); // logs requests to the console
app.use(express.json()); // allows for JSON payloads
app.use(express.urlencoded({ extended: true })); // allows for nested objects in query strings

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API documentation route
app.use('/', swaggerRouter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', protect, usersRouter);
app.use('/api/products', protect, productsRouter);
app.use('/api/orders', protect, ordersRouter);

// Root route serves the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
