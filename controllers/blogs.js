const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { Blog, User, Session } = require('../models')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')


router.get('/', async (req, res) => {
    const where = {}

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%`}},
        { author: { [Op.iLike]: `%${req.query.search}%` }}
      ]
    }

    const blogs = await Blog.findAll({
      attributes: { exclude: ['userId'] },
      include: {
        model: User,
        attributes: ['name']
      },
      where,
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
})

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  console.log(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      sess = await Session.findOne({ where: { token } })
      if (!sess) {
          return res.status(401).json({ error: 'token invalid' })
      }
      req.token = token
      req.decodedToken = jwt.verify(token, SECRET)
      const user = await User.findByPk(req.decodedToken.id)
      if (user.disabled) {
        return res.status(401).json({ error: 'user is disabled, make new account' })
      }
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