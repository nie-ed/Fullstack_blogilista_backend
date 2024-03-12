var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const summing = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(summing, 0)

}

const favoriteBlog = (blogs) => {
  const maximum = (last, blog) => {
    if (blog.likes > last) {
      return blog.likes
    }
    return last
  }
  const amount= blogs.reduce(maximum, 0)

  return blogs.find((blog) => blog.likes === amount)
}

const mostBlogs = (blogs) => {
  const authors = blogs.map((blog) => blog.author)
  const grouped = _.groupBy(authors)
  const order = _.orderBy(grouped, 'length')
  const last = _.last(order)

  const result= {
    author: last[0],
    blogs: last.length
  }

  return result
}

const mostLikes = (blogs) => {
  var authors = []
  let likes = []
  for (let i = 0; i < blogs.length; i++) {
    if (authors.includes(blogs[i].author)){
      likes[_.indexOf(authors, blogs[i].author)] += blogs[i].likes
    } else {
      authors.push(blogs[i].author)
      likes.push(blogs[i].likes)
    }
  }
  const maximum = (last, like) => {
    if (like > last) {
      return like
    }
    return last
  }
  const amount= likes.reduce(maximum, 0)

  const authorName = authors[_.indexOf(likes, amount)]

  const result = {
    author: authorName,
    likes: amount
  }

  return result
}




module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}