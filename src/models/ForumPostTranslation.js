import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ForumPostTranslation extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      post_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'forum_posts',
          key: 'id'
        },
        unique: "unique_post_locale"
      },
      locale: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: "unique_post_locale"
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'forum_post_translations',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "forum_post_translations_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "unique_post_locale",
          unique: true,
          fields: [
            { name: "post_id" },
            { name: "locale" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.ForumPost, {
      as: 'post',
      foreignKey: 'post_id'
    });
  }
}
