import express from 'express'
import router from './router'
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

app.use('/api', router)

export default app
