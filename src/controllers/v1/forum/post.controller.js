import dotenv from 'dotenv';
dotenv.config();

import ForumService from "../../../services/forum.service.js";
import { successResponse } from "../../../utils/response.util.js";
import { PostResponseDTO } from '../../../dtos/forum/post/response/post.response.dto.js';

export default class PostController {
    constructor() {
        this.forumService = new ForumService();
    }

    index = async (req, res, next) => {
        const locale = req.query.locale
            ?? req.headers['accept-language']
            ?? process.env.APP_LOCALE;
        const topicId = req.query.topicId;

        try {
            const posts = await this.forumService.getPostsByTopicId(locale, topicId);

            const response = posts.map(p => PostResponseDTO.fromModel(p));

            return res.status(200).json(
                successResponse('Posts retrieved successfully.', response)
            )
        } catch (error) {
            next(error);
        }

    }

    getPostBySlug = async (req, res, next) => {
        const locale = req.query.locale
            ?? req.headers['accept-language']
            ?? process.env.APP_LOCALE;
        const slug = req.query.slug ?? "";

        console.log(slug);

        if (!slug) {
            res.status(400).json('Slug is required!');
        }

        try {
            const post = await this.forumService.getPostBySlug(locale, slug);

            const response = new PostResponseDTO(post);

            res.status(200).json(
                successResponse('Post retireved successfully.', response)
            );
        } catch (error) {
            next(error);
        }
    }
}