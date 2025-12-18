import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ForumPost extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      topic_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'forum_topics',
          key: 'id'
        }
      },
      banner_img: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      slug: {
        type: DataTypes.STRING(255),
      }
    }, {
      sequelize,
      tableName: 'forum_posts',
      schema: 'public',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: "forum_posts_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "forum_posts_topic_id_created_at_index",
          fields: [
            { name: "topic_id" },
            { name: "created_at" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.ForumTopic, {
      as: 'topic',
      foreignKey: 'topic_id'
    });

    this.hasOne(models.ForumPostTranslation, {
      as: 'translation',
      foreignKey: 'post_id',
    });

    this.hasMany(models.ForumComment, {
      as: 'comments',
      foreignKey: 'post_id',
    });
  }
}
