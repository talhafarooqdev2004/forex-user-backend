import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ForumTopicTranslation extends Model {
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
        },
        unique: "unique_topic_locale"
      },
      locale: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: "unique_topic_locale"
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'forum_topic_translations',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "forum_topic_translations_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "unique_topic_locale",
          unique: true,
          fields: [
            { name: "topic_id" },
            { name: "locale" },
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
  }
}
