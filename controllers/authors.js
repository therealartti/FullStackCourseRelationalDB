const router = require('express').Router()
const { Blog } = require('../models');
const { col, fn } = require('sequelize');

router.get('/', async (req, res, next) => {
  const authors = await Blog.findAll({
    attributes: [
      'author',
      [fn('COUNT', col('blog.id')), 'articles'],
      [fn('SUM', col('blog.likes')), 'likes']
    ],
    group: ['blog.author'],
    order: [[fn('SUM', col('blog.likes')), 'DESC']]
  });

  res.json(authors.map(author => ({
    author: author.dataValues.author,
    articles: author.dataValues.articles.toString(), 
    likes: author.dataValues.likes.toString() 
  })));
});

module.exports = router;


