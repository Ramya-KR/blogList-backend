const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')

blogRouter.get('/', (request, response,next) => {
    Blog.find({}).then(blogs => {
        response.json(blogs)
    })
})

blogRouter.post('/', (request, response,next) => {
    const blog = new Blog(request.body)
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
      .catch(error => next(error))
  })
  

module.exports = blogRouter
  