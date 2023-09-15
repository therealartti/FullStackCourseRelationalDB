const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { ReadingList, User, Session } = require('../models')
const { SECRET } = require('../util/config')

router.post('/', async (req, res) => {
  const readinglistElements = await ReadingList.create({
    blogId: req.body.blogId,
    userId: req.body.userId
  })
  res.json(readinglistElements)
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

router.put('/:id', tokenExtractor, async (req, res, next) => {
    const readinglistElements = await ReadingList.findByPk( req.params.id );
    if (readinglistElements.userId === req.decodedToken.id) {
        readinglistElements.read = req.body.read;
        await readinglistElements.save();
        res.json(readinglistElements);
    } else {
        res.status(401).json({ error: 'Do not change the readinglist of others' })
    }
  })

module.exports = router