const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  if(!request.token){
    return response.status(401).json({ error: 'token is null' })
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const user = request.user

  console.log(request.user)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })
  console.log(blog['title'], blog['url'])
  if (!blog['title'] || !blog['url']) {
    response.status(400).end()
  }
  else {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    return response.status(201).json(savedBlog)
  }
})

blogRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogRouter.delete('/:id', async (request, response, next) => {
  console.log(request)
  if(!request.user) {
    response.status(401).json({error: 'Invalid/missing token'})
  }
  const blog = await Blog.findById(request.params.id)
  console.log(blog)
  if(blog.user.toString() !== request.user.id.toString()){
    response.status(401).json({error: 'Unauthorized user'})
  }
  
  await Blog.findByIdAndRemove(request.params.id)
 
  response.status(204).end()
})

blogRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})

module.exports = blogRouter
