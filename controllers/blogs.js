const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')


router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      try {
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      } catch{
        return res.status(401).json({ error: 'token invalid' })
      }
    }  else {
      return res.status(401).json({ error: 'token missing' })
    }
    next()
}
  
router.post('/', tokenExtractor, async (req, res, next) => {
try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
} catch(error) {
    next(error)
}
})

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}
  
router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
    if (!req.blog) {
        return res.status(404).json({ error: 'Blog not found' })
    }
    if (req.blog.userId !== req.decodedToken.id) {
        return res.status(403).json({ error: 'Only the author can delete this blog' })
    }
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