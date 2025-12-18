import { Op } from "sequelize"
import models from "../../models/index.js"

export default class PostRepository {
    all = async (locale, ids) => {
        return await models.ForumPost.findAll({
            attributes: ['id', 'banner_img', 'slug', 'created_at'],
            where: {
                id: {
                    [Op.in]: ids.split(',').map(id => Number(id))
                }
            },
            include: [
                {
                    model: models.ForumPostTranslation,
                    as: 'translation',
                    attributes: ['title', 'content'],
                    where: { locale },
                    required: false,
                }
            ],
            order: [['created_at', 'DESC']],
        })
    }

    findPostsByTopicId = async (locale, topicId) => {
        return await models.ForumPost.findAll({
            where: { topic_id: topicId },
            include: [
                {
                    model: models.ForumPostTranslation,
                    as: 'translation',
                    attributes: ['title', 'content'],
                    where: { locale },
                    required: false,
                }
            ],
            order: [['created_at', 'DESC']],
        });
    }

    findPostBySlug = async (locale, slug) => {
        return await models.ForumPost.findOne({
            where: { slug },
            include: [
                {
                    model: models.ForumPostTranslation,
                    as: 'translation',
                    attributes: ['title', 'content'],
                    where: { locale },
                    required: false,
                },
                {
                    model: models.ForumTopic,
                    as: 'topic',
                    attributes: ['id'],
                    required: false,
                    include: [
                        {
                            model: models.ForumTopicTranslation,
                            as: 'translation',
                            attributes: ['title'],
                            where: { locale },
                            required: false,
                        }
                    ]
                }
            ]
        })
    }
}