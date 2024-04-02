import express from 'express'

import { signUp } from './handlers/user'
import { signIn } from './handlers/user'

import usersRouter from './routes/users'
import productsRouter from './routes/products'
import ordersRouter from './routes/orders'
import orderItemsRouter from './routes/orderItems'

import morgan from 'morgan'
import cors from 'cors'

import { protect } from './modules/auth'

const app = express()

// Third-party middleware
app.use(cors()) // allows for cross-origin requests
app.use(morgan('dev')) // logs requests to the console
app.use(express.json()) // allows for JSON payloads
app.use(express.urlencoded({ extended: true })) // allows for nested objects in query strings

// Custom middleware
// app.use((req, res, next) => {
// 	console.log('Hello from middleware')
// 	next()
// })

app.get('/', (req, res) => {
	console.log('Hello from Express')
	res.status(200)
	res.json({message: 'Hello World!'})
})

// Routes
app.post('/signup', signUp)
app.post('/signin', signIn)

app.use('/api/users', protect, usersRouter)
app.use('/api/products', protect, productsRouter)
app.use('/api/orders', protect, ordersRouter)
app.use('/api/order-items', protect, orderItemsRouter)


export default app
