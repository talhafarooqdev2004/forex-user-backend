import CommentService from "@/services/comment.service.js";
import { successResponse } from "@/utils/response.util.js";
import { CommentResponseDTO } from "@/dtos/forum/comment/response/comment.response.dto.js";

export default class CommentController {
    constructor() {
        this.commentService = new CommentService();
    }

    create = async (req, res, next) => {
        try {
            const { postId, content } = req.body;
            const userId = req.user.id; // From auth middleware

            if (!postId) {
                return res.status(400).json({
                    success: false,
                    message: 'Post ID is required'
                });
            }

            if (!content || !content.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Comment content is required'
                });
            }

            const comment = await this.commentService.createComment(postId, userId, content);
            const response = CommentResponseDTO.fromModel(comment);

            return res.status(201).json(
                successResponse('Comment created successfully.', response)
            );
        } catch (error) {
            next(error);
        }
    }

    getByPostId = async (req, res, next) => {
        try {
            const { postId } = req.params;

            if (!postId) {
                return res.status(400).json({
                    success: false,
                    message: 'Post ID is required'
                });
            }

            const comments = await this.commentService.getCommentsByPostId(postId);
            const response = comments.map(c => CommentResponseDTO.fromModel(c));

            return res.status(200).json(
                successResponse('Comments retrieved successfully.', response)
            );
        } catch (error) {
            next(error);
        }
    }

    getCountByPostId = async (req, res, next) => {
        try {
            const { postId } = req.params;

            if (!postId) {
                return res.status(400).json({
                    success: false,
                    message: 'Post ID is required'
                });
            }

            const count = await this.commentService.getCommentCountByPostId(postId);

            return res.status(200).json(
                successResponse('Comment count retrieved successfully.', { count })
            );
        } catch (error) {
            next(error);
        }
    }
}

