import express from 'express'

import usersRouter from './routes/users'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import orderItemsRouter from './routes/orderItems'

import morgan from 'morgan'
import cors from 'cors'

const app = express()

// Third-party middleware
app.use(cors()) // allows for cross-origin requests
app.use(morgan('dev')) // logs requests to the console
app.use(express.json()) // allows for JSON payloads
app.use(express.urlencoded({ extended: true })) // allows for nested objects in query strings

// Custom middleware
app.use((req, res, next) => {
	console.log('Hello from middleware')
	next()
})

app.get('/', (req, res) => {
	console.log('Hello from Express')
	res.status(200)
	res.json({message: 'Hello World!'})
})

// Routes
app.use('/api/users', usersRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/order-items', orderItemsRouter)

export default app
