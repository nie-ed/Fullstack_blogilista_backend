const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
  {
    title: 'Test Blog 1',
    author: 'Aaa Bbb',
    url: 'Test Blog 1 url',
    likes: 1
  },

  {
    title: 'Test Blog 2',
    author: 'Ccc Ddd',
    url: 'Test Blog 2 url'
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}


module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}