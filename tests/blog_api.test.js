const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./blog_helper')
const api = supertest(app)



beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('when there are intial blogs', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
})

describe('viewing specific blog', () => {
    test('requested blog is returned', async () => {
        const response = await api.get('/api/blogs/5a422b3a1b54a676234d17f9')
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

        await api.post('/api/blogs')
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
            .send(newBlog)
            .expect(400)
    })
})

describe('deletion of blog', () => {
    test('successfully deletes a specific blog', async () => {
        const existingBlogs = await helper.blogsInDb()
        console.log(existingBlogs)
        const blogToDelete = existingBlogs[1]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
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
            .send(blog)

        const blogsAtEnd = await helper.blogsInDb()
        const updatedBlog = blogsAtEnd[2]

        expect(updatedBlog['likes']).not.toEqual(blogBeforeUdpate['likes'])
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})