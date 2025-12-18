import models from '../models/index.js';

class PageContentRepository {
    async findByPageIdentifier(pageIdentifier, locale) {
        return models.PageContent.findAll({
            attributes: ['id', 'section_key'],
            where: {
                page_identifier: pageIdentifier,
                is_active: true,
            },
            include: [{
                model: models.PageContentTranslation,
                as: 'translations',
                attributes: ['id', 'locale', 'content_value'],
                where: {
                    locale
                },
                required: false,
            }, ],
            order: [
                ['display_order', 'ASC']
            ],
            nest: true,
        });
    }
}

export default new PageContentRepository();

