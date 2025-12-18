import models from "../../models/index.js"

export default class TopicRepository {
    all = async (locale) => {
        return await models.ForumTopic.findAll({
            attributes: ['id', 'created_at'],
            include: [
                {
                    model: models.ForumTopicTranslation,
                    as: 'translation',
                    where: { locale },
                    attributes: ['title'],
                    required: false,
                },
                {
                    model: models.ForumPost,
                    as: 'posts',
                    attributes: ['id'],
                    required: false,
                    order: [['created_at', 'DESC']],
                }
            ],
            order: [['created_at', 'DESC']],
            subQuery: false,
            raw: false,
            nest: true
        });
    }
}