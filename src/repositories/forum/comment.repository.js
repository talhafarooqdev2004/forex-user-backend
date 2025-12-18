import { Op } from "sequelize"
import models from "../../models/index.js"
import { User } from "../../config/database.js"

export default class CommentRepository {
    create = async (postId, userId, content) => {
        return await models.ForumComment.create({
            post_id: postId,
            user_id: userId,
            content: content
        });
    }

    findByPostId = async (postId) => {
        return await models.ForumComment.findAll({
            where: { post_id: postId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
        });
    }

    findById = async (id) => {
        return await models.ForumComment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                }
            ]
        });
    }

    countByPostId = async (postId) => {
        return await models.ForumComment.count({
            where: { post_id: postId }
        });
    }
}

