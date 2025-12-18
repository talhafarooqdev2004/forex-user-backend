import _sequelize from 'sequelize';
const {
    Model
} = _sequelize;

export default class PageContent extends Model {
    static init(sequelize, DataTypes) {
        return super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                primaryKey: true
            },
            page_identifier: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: "page_contents_page_identifier_section_key_key"
            },
            section_key: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: "page_contents_page_identifier_section_key_key"
            },
            content_type: {
                type: DataTypes.ENUM('text', 'rich_text', 'html'),
                allowNull: false,
                defaultValue: "text"
            },
            display_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, {
            sequelize,
            tableName: 'page_contents',
            schema: 'public',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [{
                name: "page_contents_page_identifier_section_key_key",
                unique: true,
                fields: [{
                    name: "page_identifier"
                }, {
                    name: "section_key"
                }, ]
            }, {
                name: "page_contents_pkey",
                unique: true,
                fields: [{
                    name: "id"
                }, ]
            }, ]
        });
    }

    static associate(models) {
        this.hasOne(models.PageContentTranslation, {
            as: 'translations',
            foreignKey: 'page_content_id'
        });
    }
}

