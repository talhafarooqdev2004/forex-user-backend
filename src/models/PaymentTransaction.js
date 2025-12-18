import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PaymentTransaction extends Model {
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
            payment_gateway_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'payment_gateways',
                    key: 'id'
                }
            },
            transaction_id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: 'USD'
            },
            status: {
                type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending'
            },
            gateway_response: {
                type: DataTypes.JSON,
                allowNull: true
            },
            failure_reason: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            completed_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'payment_transactions',
            schema: 'public',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    name: "payment_transactions_pkey",
                    unique: true,
                    fields: [{ name: "id" }]
                },
                {
                    name: "payment_transactions_user_id_idx",
                    fields: [{ name: "user_id" }]
                },
                {
                    name: "payment_transactions_package_id_idx",
                    fields: [{ name: "package_id" }]
                },
                {
                    name: "payment_transactions_status_idx",
                    fields: [{ name: "status" }]
                },
                {
                    name: "payment_transactions_transaction_id_unique",
                    unique: true,
                    fields: [{ name: "transaction_id" }]
                }
            ]
        });
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        this.belongsTo(models.SubscriptionPackage, { foreignKey: 'package_id', as: 'package' });
        this.belongsTo(models.PaymentGateway, { foreignKey: 'payment_gateway_id', as: 'paymentGateway' });
    }
}

