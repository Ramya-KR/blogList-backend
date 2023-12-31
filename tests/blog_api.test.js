const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./blog_helper')
const api = supertest(app)
const bcrypt = require('bcrypt')

jest.useRealTimers()


beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('when there are intial blogs', () => {
    test('blogs are returned as json', async () => {

        await api
            .get('/api/blogs')
            .set('authorization', process.env.TOKEN)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs').set('authorization', process.env.TOKEN)
        const blogLength = helper.initialBlogs.length
        console.log(blogLength)
        expect(response.body).toHaveLength(blogLength)
    })
})

describe('viewing specific blog', () => {
    test('requested blog is returned', async () => {

        const response = await api.get('/api/blogs/5a422b3a1b54a676234d17f9').set('authorization', process.env.TOKEN)
        console.log(response.body)
        expect(response.body).toBeDefined()
    })
})

describe('addition of blogs', () => {

    test('new blog is added', async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
        }

        await api
            .post('/api/blogs')
            .set('authorization', process.env.TOKEN)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        console.log(blogsAtEnd)
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(n => n.title)
        expect(contents).toContain(
            'Type wars'
        )
    })

    test('add default likes if missing', async () => {

        const newBlog = {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        }

        if (!(newBlog['likes'] == undefined)) {
            newBlog['likes'] = 0
        } else {
            console.log('likes is already present')
        }

        await api.post('/api/blogs')
            .set('authorization', process.env.TOKEN)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        console.log(blogsAtEnd)
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const contents = blogsAtEnd.map(n => n.title)
        expect(contents).toContain(
            'TDD harms architecture'
        )
    }
    )

    test('reject invalid blog', async () => {

        const newBlog = {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            likes: 7,
        }

        await api.post('/api/blogs')
            .set('authorization', process.env.TOKEN)
            .send(newBlog)
            .expect(400)
    })

    test('reject adding blog when token is not provided', async  () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

    })
})

describe('deletion of blog', () => {
    test('successfully deletes a specific blog', async () => {

        const existingBlogs = await helper.blogsInDb()
        console.log(existingBlogs)
        const blogToDelete = existingBlogs[2]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('authorization', process.env.TOKEN)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

        const title = blogsAtEnd.map(b => b.title)
        expect(title).not.toContain(blogToDelete.title)
    })
})

describe('updating a blog', () => {
    test('succesfully updates an existing blog', async () => {

        const blogsAtStart = await helper.blogsInDb()
        const blogBeforeUdpate = blogsAtStart[2]
        const blog = {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 20
        }
        await api
            .put(`/api/blogs/${blog._id}`)
            .set('authorization', process.env.TOKEN)
            .send(blog)

        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlog = blogsAtEnd[2]

        expect(updatedBlog['likes']).not.toEqual(blogBeforeUdpate['likes'])
    })
})

describe('when there is initially one user at db', () => {

    test('creation succeeds for a new user', async () => {

        const usersAtStart = await helper.usersInDb()
        console.log(usersAtStart)
        const newUser = {
            "username": "shilpa",
            "name": "Shilpa Kamishetty",
            "password": "shilshan",
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    })

    test('creation fails when a user already exists', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            "username": "hellas",
            "name": "Robert C. Martin",
            "password": "romart",
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        console.log(result.error.text)
        expect(result.error.text).toContain('expected username to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails when username does not meet length criteria', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            "username": "he",
            "name": "Arto Hellas",
            "password": "hellar43",
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.error.text).toContain('username must have atleast 3 characters')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails when password does not meet length criteria', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            "username": "ramyakr",
            "name": "Ramya K R",
            "password": "he",
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.text).toContain('Password should be at least 3 characters long')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})
afterAll(async () => {
    await mongoose.connection.close()
})