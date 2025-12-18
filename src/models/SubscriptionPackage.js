import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class SubscriptionPackage extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            price: {
                type: DataTypes.DECIMAL,
                allowNull: false
            },
            duration_hours: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            free_trial_hours: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            additional_discounts: {
                type: DataTypes.JSON,
                allowNull: true
            },
            campaigns: {
                type: DataTypes.JSON,
                allowNull: true
            },
            publish: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            sequelize,
            tableName: 'subscription_packages',
            schema: 'public',
            timestamps: false,
            indexes: [
                {
                    name: "subscription_packages_pkey",
                    unique: true,
                    fields: [
                        { name: "id" },
                    ]
                },
            ]
        });

    }

    static associate(models) {
        this.hasOne(models.SubscriptionPackageTranslation, {
            as: 'translation',
            foreignKey: 'subscription_package_id',
        });
    }
}
