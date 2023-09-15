const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readinglist')
const Session = require('./session')

Blog.belongsTo(User)
User.hasMany(Blog)

Blog.belongsToMany(User, { through: ReadingList, as: 'readingUser' });
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' });


module.exports = {
  Blog, User, ReadingList, Session
}