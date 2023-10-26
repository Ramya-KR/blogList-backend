const totalLikes = require('../utils/list_helper').totalLikes

describe('totalLikes', () => {
    test('of empty list is zero',()=> {
        expect(totalLikes([])).toBe(0)
    })

    test('when list has only one blog equals the likes of that',() => {
        const blogs = [{
            "title": "8 Blogs To Read When You Need A Little Inspiration",
            "author": "Deanna",
            "url": "https://lifebydeanna.com/8-blogs-to-read-when-you-need-a-little-inspiration/",
            "likes": 946
        }]
        expect(totalLikes(blogs)).toBe(946)
    })

    test('of a bigger list is calculated right',() => {
        const blogs = [{
            "title": "8 Blogs To Read When You Need A Little Inspiration",
            "author": "Deanna",
            "url": "https://lifebydeanna.com/8-blogs-to-read-when-you-need-a-little-inspiration/",
            "likes": 946
        },
        {
            "title": "22 Blogs to Read",
            "author": "Anil Agarwal",
            "url": "https://bloggerspassion.com/best-indian-blogs-to-read/",
            "likes": 2000
        },
        {
            "title": "Blog on Pyschology",
            "author": "Anil Agarwal",
            "url": "https://bloggerspassion.com/blog-on-pyschology",
            "likes": 500 
        }
    ]
    expect(totalLikes(blogs)).toBe(3446)
    })
})