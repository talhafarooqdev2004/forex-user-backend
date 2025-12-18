import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ForumTopic extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      }
    }, {
      sequelize,
      tableName: 'forum_topics',
      schema: 'public',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: "forum_topics_created_at_index",
          fields: [
            { name: "created_at" },
          ]
        },
        {
          name: "forum_topics_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.hasOne(models.ForumTopicTranslation, {
      as: 'translation',
      foreignKey: 'topic_id'
    });

    this.hasMany(models.ForumPost, {
      as: 'posts',
      foreignKey: 'topic_id'
    });
  }
}
