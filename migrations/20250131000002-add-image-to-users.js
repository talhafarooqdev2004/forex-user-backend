export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'image', {
        type: Sequelize.STRING(500),
        allowNull: true,
    });
}

export async function down(queryInterface) {
    await queryInterface.removeColumn('users', 'image');
}
