const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const UserMeta = require('./UserMeta');
const UserProfile = require('./UserProfile');
const Post = require('./Post');
const PostMeta = require('./PostMeta');
const PostViews = require('./PostViews');
// const Term = require('./Term'); // TODO: Create taxonomy models
// const TermTaxonomy = require('./TermTaxonomy');
// const TermRelationship = require('./TermRelationship');
const TermMeta = require('./TermMeta');
const Comment = require('./Comment');
const CommentMeta = require('./CommentMeta');
const Option = require('./Option');
const Link = require('./Link');
const Advertisement = require('./Advertisement');
const Analytics = require('./Analytics');

// Define associations/relationships
// User relationships
User.hasMany(UserMeta, { foreignKey: 'user_id', as: 'meta' });
UserMeta.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Post, { foreignKey: 'post_author', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'post_author', as: 'author' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Link, { foreignKey: 'link_owner', as: 'links' });
Link.belongsTo(User, { foreignKey: 'link_owner', as: 'owner' });

// Post relationships
Post.hasMany(PostMeta, { foreignKey: 'post_id', as: 'meta' });
PostMeta.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

Post.hasMany(Comment, { foreignKey: 'comment_post_ID', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'comment_post_ID', as: 'post' });

// Post.hasMany(TermRelationship, { foreignKey: 'object_id', as: 'termRelationships' });
// TermRelationship.belongsTo(Post, { foreignKey: 'object_id', as: 'post' });

Post.hasOne(PostViews, { foreignKey: 'id', sourceKey: 'ID', as: 'views' });
PostViews.belongsTo(Post, { foreignKey: 'id', targetKey: 'ID', as: 'post' });

// Term relationships - TODO: Implement taxonomy system
// Term.hasMany(TermTaxonomy, { foreignKey: 'term_id', as: 'taxonomies' });
// TermTaxonomy.belongsTo(Term, { foreignKey: 'term_id', as: 'term' });

// Term.hasMany(TermMeta, { foreignKey: 'term_id', as: 'meta' });
// TermMeta.belongsTo(Term, { foreignKey: 'term_id', as: 'term' });

// TermTaxonomy.hasMany(TermRelationship, { foreignKey: 'term_taxonomy_id', as: 'relationships' });
// TermRelationship.belongsTo(TermTaxonomy, { foreignKey: 'term_taxonomy_id', as: 'taxonomy' });

// Comment relationships
Comment.hasMany(CommentMeta, { foreignKey: 'comment_id', as: 'meta' });
CommentMeta.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });

// Self-referencing for comment replies
Comment.hasMany(Comment, { foreignKey: 'comment_parent', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'comment_parent', as: 'parent' });

// Advertisement relationships
User.hasMany(Advertisement, { foreignKey: 'advertiser_id', as: 'advertisements' });
Advertisement.belongsTo(User, { foreignKey: 'advertiser_id', as: 'advertiser' });

// Analytics relationships
Post.hasMany(Analytics, { foreignKey: 'content_id', as: 'analytics' });
Analytics.belongsTo(Post, { foreignKey: 'content_id', as: 'post' });

User.hasMany(Analytics, { foreignKey: 'user_id', as: 'analytics' });
Analytics.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Many-to-many relationship between Posts and Terms through TermRelationship - TODO: Implement
// Post.belongsToMany(TermTaxonomy, {
//   through: TermRelationship,
//   foreignKey: 'object_id',
//   otherKey: 'term_taxonomy_id',
//   as: 'categories'
// });

// TermTaxonomy.belongsToMany(Post, {
//   through: TermRelationship,
//   foreignKey: 'term_taxonomy_id',
//   otherKey: 'object_id',
//   as: 'posts'
// });

// Export all models
module.exports = {
  sequelize,
  User,
  UserMeta,
  UserProfile,
  Post,
  PostMeta,
  PostViews,
  // Term, // TODO: Implement taxonomy models
  // TermTaxonomy,
  // TermRelationship,
  TermMeta,
  Comment,
  CommentMeta,
  Option,
  Link,
  Advertisement,
  Analytics
};