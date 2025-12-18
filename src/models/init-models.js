import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _SequelizeMeta from  "./SequelizeMeta.js";
import _cache from  "./cache.js";
import _cache_locks from  "./cache_locks.js";
import _education_translations from  "./education_translations.js";
import _educations from  "./educations.js";
import _failed_jobs from  "./failed_jobs.js";
import _forum_post_translations from  "./forum_post_translations.js";
import _forum_posts from  "./forum_posts.js";
import _forum_topic_translations from  "./forum_topic_translations.js";
import _forum_topics from  "./forum_topics.js";
import _job_batches from  "./job_batches.js";
import _jobs from  "./jobs.js";
import _migrations from  "./migrations.js";
import _subscription_package_translations from  "./subscription_package_translations.js";
import _subscription_packages from  "./subscription_packages.js";
import _users from  "./users.js";

export default function initModels(sequelize) {
  const SequelizeMeta = _SequelizeMeta.init(sequelize, DataTypes);
  const cache = _cache.init(sequelize, DataTypes);
  const cache_locks = _cache_locks.init(sequelize, DataTypes);
  const education_translations = _education_translations.init(sequelize, DataTypes);
  const educations = _educations.init(sequelize, DataTypes);
  const failed_jobs = _failed_jobs.init(sequelize, DataTypes);
  const forum_post_translations = _forum_post_translations.init(sequelize, DataTypes);
  const forum_posts = _forum_posts.init(sequelize, DataTypes);
  const forum_topic_translations = _forum_topic_translations.init(sequelize, DataTypes);
  const forum_topics = _forum_topics.init(sequelize, DataTypes);
  const job_batches = _job_batches.init(sequelize, DataTypes);
  const jobs = _jobs.init(sequelize, DataTypes);
  const migrations = _migrations.init(sequelize, DataTypes);
  const subscription_package_translations = _subscription_package_translations.init(sequelize, DataTypes);
  const subscription_packages = _subscription_packages.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);

  education_translations.belongsTo(educations, { as: "education", foreignKey: "education_id"});
  educations.hasMany(education_translations, { as: "education_translations", foreignKey: "education_id"});
  forum_post_translations.belongsTo(forum_posts, { as: "post", foreignKey: "post_id"});
  forum_posts.hasMany(forum_post_translations, { as: "forum_post_translations", foreignKey: "post_id"});
  forum_posts.belongsTo(forum_topics, { as: "topic", foreignKey: "topic_id"});
  forum_topics.hasMany(forum_posts, { as: "forum_posts", foreignKey: "topic_id"});
  forum_topic_translations.belongsTo(forum_topics, { as: "topic", foreignKey: "topic_id"});
  forum_topics.hasMany(forum_topic_translations, { as: "forum_topic_translations", foreignKey: "topic_id"});
  subscription_package_translations.belongsTo(subscription_packages, { as: "subscription_package", foreignKey: "subscription_package_id"});
  subscription_packages.hasMany(subscription_package_translations, { as: "subscription_package_translations", foreignKey: "subscription_package_id"});

  return {
    SequelizeMeta,
    cache,
    cache_locks,
    education_translations,
    educations,
    failed_jobs,
    forum_post_translations,
    forum_posts,
    forum_topic_translations,
    forum_topics,
    job_batches,
    jobs,
    migrations,
    subscription_package_translations,
    subscription_packages,
    users,
  };
}
