const _ = require("lodash");

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const sum = likes.reduce((sum, item) => {
        return sum + item
    }, 0)
    return sum
}

const favoriteBlog = (blogs) => {
    const likes = blogs.map(blog => blog.likes)
    const maxLike = Math.max(...likes)
    console.log(maxLike)
    const favorite = blogs.find(blog => blog.likes === maxLike)
    return favorite ? favorite : []
}

const mostBlogs = (blogs) => {
    const blogCounts = _.countBy(blogs,'author')
    const mostBlogged = _.max(_.toPairs(blogCounts), _.last)
    let mostBlog ={}
    mostBlogged? (mostBlog = {   
        'author': mostBlogged[0],
        'blogs': mostBlogged[1]
    }):[]
    return mostBlog
}

const mostLikes = (blogs) => {
    const groupedBlogs = _.groupBy(blogs,'author')
    console.log(groupedBlogs)
    const mostLiked = groupedBlogs.length > 0 ? (_.maxBy(_.map(groupedBlogs, (blog,author) => ({
        author,
        'likes': _.sumBy(blog,'likes')
    })),'likes')) : {}
    
    console.log(mostLiked)
    return mostLiked
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs,mostLikes
}