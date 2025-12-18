import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class SubscriptionPackageTranslation extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      subscription_package_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'subscription_packages',
          key: 'id'
        },
        unique: "unique_subscription_package_locale"
      },
      locale: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: "unique_subscription_package_locale"
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      detail: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'subscription_package_translations',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "subscription_package_translations_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "unique_subscription_package_locale",
          unique: true,
          fields: [
            { name: "subscription_package_id" },
            { name: "locale" },
          ]
        },
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.SubscriptionPackage, {
      as: 'package',
      foreignKey: 'subscription_package_id',
    });
  }
}
