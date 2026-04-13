import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import catchAsync from './middelware/catchAsync.js';
import ErrorHandler from './middelware/errorHandler.js';
import {logger, httpLogger} from './middelware/httpLogger.js'

const app = express()

app.use(helmet())
app.use(cors({origin: ['http://www.mydomain.com']}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(httpLogger)

const PORT = process.env.PORT || 4000

app.get('/', catchAsync(async(req, res, next) => {
  res.json({
    success: true,
    message:'Home Page'
  })
}))

app.use((req, res, next) => {
  return next(new ErrorHandler(404, 'Page Not Found!'))
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode || 500

  logger.error({
    success: false,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    error: err.message
  })

  res.status(statusCode).json({
    success: false,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    message: err.isOperational ? err.message : 'Internal Server Error',
    error: process.env.NODE_ENV == 'Development' ? err.stack : undefined
  })
})

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log('Server is running on PORT', PORT)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()