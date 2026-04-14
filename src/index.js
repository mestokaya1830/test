import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import catchAsync from './middelware/catchAsync.js';
import ErrorHandler from './middelware/errorHandler.js'
import {httpLogger, logger} from './middelware/httpLogger.js'

const app = express()
const PORT = process.env.PORT

app.use(helmet())
app.use(cors({origin: ['https://mydomain.com']}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(httpLogger)

app.get('/', catchAsync(async(req, res, next) => {
  res.json({
    success: true,
    message: 'Home Page',
    data: 'Mesto Kaya'
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
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message : 'Internal Server Error',
  })

  res.status(statusCode).json({
    success: false,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    message: err.isOperational ? err.message : 'Internal Server Error',
    stack: process.env.NODE_ENV == 'development' ? err.stack : undefined
  })
})


const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log('Server is running om PORT', PORT)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

start()