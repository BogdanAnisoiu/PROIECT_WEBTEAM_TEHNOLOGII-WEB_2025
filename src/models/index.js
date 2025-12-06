const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: false,
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize);
db.FriendRequest = require('./friendRequest')(sequelize);
db.Course = require('./course')(sequelize);
db.Note = require('./note')(sequelize);
db.Attachment = require('./attachment')(sequelize);
db.Share = require('./share')(sequelize);

// Relatii
db.User.hasMany(db.Note, { foreignKey: 'userId', as: 'notes' });
db.Note.belongsTo(db.User, { foreignKey: 'userId', as: 'author' });

db.Course.hasMany(db.Note, { foreignKey: 'courseId', as: 'notes' });
db.Note.belongsTo(db.Course, { foreignKey: 'courseId', as: 'course' });

db.Note.hasMany(db.Attachment, { foreignKey: 'noteId', as: 'attachments' });
db.Attachment.belongsTo(db.Note, { foreignKey: 'noteId', as: 'note' });

db.User.belongsToMany(db.User, {
  as: 'friends',
  through: 'UserFriends',
  foreignKey: 'userId',
  otherKey: 'friendId',
});

db.User.hasMany(db.FriendRequest, {
  foreignKey: 'receiverId',
  as: 'receivedFriendRequests',
});
db.User.hasMany(db.FriendRequest, {
  foreignKey: 'senderId',
  as: 'sentFriendRequests',
});
db.FriendRequest.belongsTo(db.User, { foreignKey: 'receiverId', as: 'receiver' });
db.FriendRequest.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

db.Note.belongsToMany(db.User, {
  through: db.Share,
  as: 'sharedWith',
  foreignKey: 'noteId',
  otherKey: 'userId',
});
db.User.belongsToMany(db.Note, {
  through: db.Share,
  as: 'sharedNotes',
  foreignKey: 'userId',
  otherKey: 'noteId',
});

module.exports = db;


