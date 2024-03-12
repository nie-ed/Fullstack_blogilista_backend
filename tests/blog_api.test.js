const bcrypt = require('bcrypt')
const User = require('../models/user')
const { test, after, describe, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const helper = require('./test_helper')



const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

describe('blogs api tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('there are id:s and they are not undefined', async () => {
    const blogesAtStart = await helper.blogsInDb()
    assert(blogesAtStart[0].id)
  })

  test('if no likes set, then 0 likes', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body[1].likes, 0)
  })

  test('blogs can be added', async () => {
    const blog = {
      title:'added title',
      author: 'added url',
      url: 'added url'
    }
    await api
      .post('/api/blogs')
      .send(blog)
      .expect(201)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length +1)
  })


  test('if no title => error', async () => {
    const blogNoTitle = {
      author: 'No title',
      url: 'No title'
    }
    await api
      .post('/api/blogs')
      .send(blogNoTitle)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })


  test('if no url => error', async () => {
    const blogNoTitle = {
      title: 'No url',
      author: 'No url',
    }
    await api
      .post('/api/blogs')
      .send(blogNoTitle)
      .expect(400)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a blog can be deleted', async () => {
    const blogesAtStart = await helper.blogsInDb()
    const blogToDelete = blogesAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogAtEnd = await helper.blogsInDb()

    const contents = blogAtEnd.map(r => r.title)
    assert(!contents.includes(blogToDelete.title))

    assert.strictEqual(blogAtEnd.length, helper.initialBlogs.length - 1)
  })

  test('a blog can be updated', async () => {
    const blogesAtStart = await helper.blogsInDb()
    const blogToUpdate = blogesAtStart[0]

    const blog = {
      likes: 8
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blog)
      .expect(200)

    const blogAtEnd = await helper.blogsInDb()
    const contents = blogAtEnd.map(r => r.likes)
    assert(contents.includes(8))

  })


  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

  })

  describe('testing that when creating a user, requirements are met ', () => {

    test('creation does not succeed with a too short username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'm',
        name: 'Matti',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('User validation failed: username: Path `username` (`m`) is shorter than the minimum allowed length (3).'))
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation does not succeed with a too short password', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'matti',
        name: 'Matti',
        password: 's',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('password needs to at least 3 characters long'))
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('creation does not succeed with a username that is already in the db', async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })

      await user.save()
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Rootti',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

  })

})

after(async () => {
  await mongoose.connection.close()
})
