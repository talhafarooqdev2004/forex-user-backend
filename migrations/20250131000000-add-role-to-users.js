'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn('users', 'role');
    // Also drop the enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
}
