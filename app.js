const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogRouter = require('./contollers/blogs')
const userRouter = require('./contollers/users')
const loginRouter = require('./contollers/login')

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
app.use(middleware.tokenExtractor)
app.use('/api/blogs',middleware.userExtractor,blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
if(process.env.NODE_ENV === 'test') {
    const resetRouter = require('./contollers/reset')
    app.use('/api/testing',resetRouter)
}
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app

