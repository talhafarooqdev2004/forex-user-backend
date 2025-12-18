'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'gender', {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
    });

    await queryInterface.addColumn('users', 'google_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
    });

    await queryInterface.addColumn('users', 'facebook_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
    });

    await queryInterface.addColumn('users', 'apple_id', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
    });

    // Make password nullable since Google users don't have passwords
    await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING,
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn('users', 'gender');
    await queryInterface.removeColumn('users', 'google_id');
    await queryInterface.removeColumn('users', 'facebook_id');
    await queryInterface.removeColumn('users', 'apple_id');
    
    await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING,
        allowNull: false,
    });
}

