const router = require('express').Router()

const { Blog } = require('../models')

router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})
  
router.post('/', async (req, res, next) => {
try {
    const blog = await Blog.create(req.body)
    res.json(blog)
} catch(error) {
    next(error)
}
})

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}
  
router.delete('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        await req.blog.destroy()
    }
    res.status(204).end()
});

router.put('/:id', blogFinder, async (req, res, next) => {
    try {
    if (req.blog) {
      req.blog.likes = req.body.likes
      await req.blog.save()
      res.json({likes: req.blog.likes})
    } else {
      res.status(404).end()
    }} catch(error){
        next(error)
    }
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    return response.status(500).json({ error: error.message })
}
router.use(errorHandler)

module.exports = router