import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class UserSubscription extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            package_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'subscription_packages',
                    key: 'id'
                }
            },
            payment_transaction_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: 'payment_transactions',
                    key: 'id'
                }
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM('active', 'expired', 'cancelled'),
                allowNull: false,
                defaultValue: 'active'
            },
            cancelled_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            cancellation_reason: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'user_subscriptions',
            schema: 'public',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    name: "user_subscriptions_pkey",
                    unique: true,
                    fields: [{ name: "id" }]
                },
                {
                    name: "user_subscriptions_user_id_idx",
                    fields: [{ name: "user_id" }]
                },
                {
                    name: "user_subscriptions_status_idx",
                    fields: [{ name: "status" }]
                },
                {
                    name: "user_subscriptions_user_status_idx",
                    fields: [{ name: "user_id" }, { name: "status" }]
                }
            ]
        });
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.SubscriptionPackage, { foreignKey: 'package_id', as: 'package' });
        this.belongsTo(models.PaymentTransaction, { foreignKey: 'payment_transaction_id', as: 'paymentTransaction' });
    }
}

