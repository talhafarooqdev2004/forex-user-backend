import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class EducationTranslation extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      education_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'educations',
          key: 'id'
        },
        unique: "unique_educations_locale"
      },
      locale: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "unique_educations_locale"
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
      tableName: 'education_translations',
      schema: 'public',
      timestamps: true,
      timestamps: true,
      createdAt: 'created_at',
      editedAt: 'edited_at',
      indexes: [
        {
          name: "education_translations_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "unique_educations_locale",
          unique: true,
          fields: [
            { name: "education_id" },
            { name: "locale" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.Education, {
      as: 'education',
      foreignKey: 'education_id'
    });
  }
}
