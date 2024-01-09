const resetRouter = require('express').Router()
const user = require('../models/user')
const blog = require('../models/blog')

resetRouter.post('/reset', async(request, response) => {
    await user.deleteMany({})
    await blog.deleteMany({})

    response.status(204).end()
})

module.exports = resetRouter