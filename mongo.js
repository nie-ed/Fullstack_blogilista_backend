const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack_blogi:${password}@cluster0.g9u3vls.mongodb.net/testBlogApp?retryWrites=true&w=majority&appName=Cluster0`


mongoose.set('strictQuery',false)
mongoose.connect(url)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Blog = mongoose.model('Blog', blogSchema)

//Adding blogs manually to database
/*
const blog = new Blog({
  title: 'Bloginimi',
  author: 'Niina Aaronen',
  likes: 1
})


blog.save().then(result => {
  console.log('blog saved!')
  mongoose.connection.close()
})
*/


// Adding blogs to test database
const blog = new Blog({
  title: 'Test Blog 1',
  author: 'Aaa Bbb',
  likes: 1
})

const blog_2 = new Blog({
  title: 'Test Blog 2',
  author: 'Ccc Ddd',
  likes: 2
})



blog_2.save().then(() => {
  console.log('blog saved!')
})


blog.save().then(() => {
  console.log('blog saved!')
  mongoose.connection.close()
})

/*
Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})*/