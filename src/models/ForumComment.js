import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ForumComment extends Model {
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
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'forum_comments',
      schema: 'public',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          name: "forum_comments_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "forum_comments_post_id_index",
          fields: [
            { name: "post_id" },
          ]
        },
        {
          name: "forum_comments_user_id_index",
          fields: [
            { name: "user_id" },
          ]
        },
        {
          name: "forum_comments_post_id_created_at_index",
          fields: [
            { name: "post_id" },
            { name: "created_at" },
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

    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id'
    });
  }
}

