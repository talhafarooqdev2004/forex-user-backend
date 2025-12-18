import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PaymentGateway extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            displayName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'display_name'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_active'
            },
            credentials: {
                type: DataTypes.JSON,
                allowNull: true
            },
            settings: {
                type: DataTypes.JSON,
                allowNull: true
            },
            displayOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'display_order'
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'payment_gateways',
            schema: 'public',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    name: "payment_gateways_pkey",
                    unique: true,
                    fields: [
                        { name: "id" },
                    ]
                },
                {
                    name: "payment_gateways_name_unique",
                    unique: true,
                    fields: [
                        { name: "name" },
                    ]
                },
                {
                    name: "payment_gateways_is_active_idx",
                    fields: [
                        { name: "is_active" },
                    ]
                },
            ]
        });
    }

    static associate(models) {
        // No associations needed for payment gateways
    }
}

