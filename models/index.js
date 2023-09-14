const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readinglist')

Blog.belongsTo(User)
User.hasMany(Blog)

Blog.belongsToMany(User, { through: ReadingList, as: 'readingUser' });
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' });


module.exports = {
  Blog, User, ReadingList
}