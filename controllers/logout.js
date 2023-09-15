const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const { Session } = require('../models')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7)
      await Session.findOne({ where: { token } })
      if (!sess) {
        return res.status(401).json({ error: 'token invalid' })
      }
      req.token = token
    } catch{
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

router.delete('/', tokenExtractor, async (request, response, next) => {
  if (request.token) {
      await Session.destroy({ where: { token: request.token } })
  }
  response.status(200).send()
})
  
module.exports = router