const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogRouter = require('./contollers/blogs')


mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDb')
    })
    .catch(error => {
        logger.error('error connecting to DB:',error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(middleware.requestLogger)
app.use('/api/blogs',blogRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app


