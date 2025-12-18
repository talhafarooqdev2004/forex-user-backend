import { Sequelize, DataTypes } from 'sequelize';

/**
 * @param {Sequelize} sequelize The Sequelize instance
 * @returns {import('sequelize').Model} The User Model
 */
export const User = (sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'first_name',
            },

            lastName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'last_name',
            },

            gender: {
                type: DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true,
            },

            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },

            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            facebookId: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
                field: 'facebook_id',
            },

            googleId: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
                field: 'google_id',
            },

            appleId: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
                field: 'apple_id',
            },
        },
        {
            tableName: 'users',
            timestamps: true,
            underscored: true,
        }
    );

    // Optional: Example hook to hash password before saving
    // User.beforeCreate(async (user) => {
    //   if (user.password) {
    //     const salt = await bcrypt.genSalt(10);
    //     user.password = await bcrypt.hash(user.password, salt);
    //   }
    // });

    return User;
};
