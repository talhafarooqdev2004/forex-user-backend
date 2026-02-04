'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING(20),
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn('users', 'phone');
}
