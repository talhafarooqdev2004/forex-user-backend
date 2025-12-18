import dotenv from 'dotenv';
dotenv.config();

import { TopicIndexResponseDTO } from "../../../dtos/forum/topic/response/topic.response.dto.js";
import ForumService from "../../../services/forum.service.js";
import { successResponse } from '../../../utils/response.util.js';

export default class TopicController {
    constructor() {
        this.forumService = new ForumService();
    }

    index = async (req, res, next) => {
        const locale = req.query.locale
            ?? req.headers['accept-language']
            ?? process.env.APP_LOCALE;

        try {
            const topics = await this.forumService.getTopicsWithPostIDs(locale);

            const response = topics.map(t => TopicIndexResponseDTO.fromModel(t));

            res.status(200).json(
                successResponse("Topic retrieved successfully.", response)
            );
        } catch (error) {
            next(error);
        }
    }
}