import _sequelize from 'sequelize';
const {
    Model
} = _sequelize;

export default class PageContentTranslation extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            page_content_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: 'page_contents',
                    key: 'id'
                },
                unique: "unique_page_contents_locale"
            },
            locale: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: "unique_page_contents_locale"
            },
            content_value: {
                type: DataTypes.TEXT,
                allowNull: false,
            }
        }, {
            sequelize,
            tableName: 'page_content_translations',
            schema: 'public',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [{
                name: "page_content_translations_pkey",
                unique: true,
                fields: [{
                    name: "id"
                }, ]
            }, {
                name: "unique_page_contents_locale",
                unique: true,
                fields: [{
                    name: "page_content_id"
                }, {
                    name: "locale"
                }, ]
            }, ]
        });
    }

    static associate(models) {
        this.belongsTo(models.PageContent, {
            as: 'page_content',
            foreignKey: 'page_content_id'
        });
    }
}

