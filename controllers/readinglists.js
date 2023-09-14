const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { ReadingList } = require('../models')
const { SECRET } = require('../util/config')

router.post('/', async (req, res) => {
  const readinglistElements = await ReadingList.create({
    blogId: req.body.blogId,
    userId: req.body.userId
  })
  res.json(readinglistElements)
})

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    console.log(authorization)
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