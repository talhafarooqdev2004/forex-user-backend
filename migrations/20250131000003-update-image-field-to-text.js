export async function up(queryInterface, Sequelize) {
    // Change image column from VARCHAR(500) to TEXT to support base64 images
    await queryInterface.changeColumn('users', 'image', {
        type: Sequelize.TEXT,
        allowNull: true,
    });
}

export async function down(queryInterface) {
    // Revert back to VARCHAR(500)
    await queryInterface.changeColumn('users', 'image', {
        type: Sequelize.STRING(500),
        allowNull: true,
    });
}
