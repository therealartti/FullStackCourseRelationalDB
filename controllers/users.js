const { ValidationError } = require('sequelize');
const router = require('express').Router()

const { User, Blog, ReadingList } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res) => {
  const where = {}
  if (req.query.read) {
    where.read = req.query.read
  }

  const user = await User.findByPk( req.params.id, {
    attributes: { exclude: ['id', 'createdAt', 'updatedAt' ]},
    include: {
      model: Blog,
      as: "readings",
      attributes: { exclude: ['userId', 'createdAt', 'updatedAt'] },
      through: {
        attributes: ['read', 'id'],
        where
      }
    }
  })
  res.json(user)
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  const user = await User.findOne({ where: { username: req.params.username } })
  if (user) {
    if (req.body.username) {
        user.username = req.body.username
        try {
            await user.save()
            res.json({ user })
        } catch (error) {
            next(error)
        }
    } else {
        res.status(400).json({ error: 'Username cannot be null or empty' })
    }
  } else {
    res.status(404).end()
  }
})

const handleSequelizeError = (error, req, res, next) => {
  if (error instanceof ValidationError) {
    const messages = error.errors.map(err => err.message)
    return res.status(400).json({ error: messages })
  }
  next(error)
}

router.use(handleSequelizeError)

module.exports = router