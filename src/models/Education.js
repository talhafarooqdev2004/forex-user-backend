import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Education extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      slug: {
        type: DataTypes.STRING(255),
      },
      publish: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      sequelize,
      tableName: 'educations',
      schema: 'public',
      timestamps: true,
      createdAt: 'created_at',
      editedAt: 'edited_at',
      indexes: [
        {
          name: "educations_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.hasOne(models.EducationTranslation, {
      as: 'translation',
      foreignKey: 'education_id'
    });
  }
}
