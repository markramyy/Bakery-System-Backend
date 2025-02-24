import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

import { protect } from './modules/auth'

import usersRouter from './routes/users'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import authRouter from './routes/auth'


const app = express()

// Third-party middleware
app.use(cors()) // allows for cross-origin requests
app.use(morgan('dev')) // logs requests to the console
app.use(express.json()) // allows for JSON payloads
app.use(express.urlencoded({ extended: true })) // allows for nested objects in query strings


app.get('/', (req, res) => {
	console.log('Hello from Express')
	res.status(200)
	res.json({message: 'Hello World!'})
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', protect, usersRouter)
app.use('/api/products', protect, productsRouter)
app.use('/api/orders', protect, ordersRouter)


export default app
