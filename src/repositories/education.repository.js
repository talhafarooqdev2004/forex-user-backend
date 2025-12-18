import models from '../models/index.js';

export default class EducationRepository {
    all = async (locale) => {
        return await models.Education.findAll({
            attributes: ['id', 'slug'],
            where: { publish: true },
            include: [
                {
                    model: models.EducationTranslation,
                    as: 'translation',
                    attributes: ['title', 'content'],
                    where: { locale },
                    required: false,
                }
            ],
            order: [['created_at', 'DESC']],
            subQuery: false,
            raw: false,
            nest: true
        });
    }

    findBySlug = async (locale, slug) => {
        return await models.Education.findOne({
            attributes: ['id', 'slug'],
            where: { slug, publish: true },
            include: [
                {
                    model: models.EducationTranslation,
                    as: 'translation',
                    attributes: ['title', 'content'],
                    where: { locale },
                    required: false,
                }
            ],
            raw: false,
            nest: true
        });
    }
}