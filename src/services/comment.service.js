import CommentRepository from "../repositories/forum/comment.repository.js";
import { ApiError } from "../exceptions/ApiError.js";

export default class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
    }

    createComment = async (postId, userId, content) => {
        if (!content || !content.trim()) {
            throw new ApiError(400, 'Comment content is required');
        }

        const comment = await this.commentRepository.create(postId, userId, content);
        return await this.commentRepository.findById(comment.id);
    }

    getCommentsByPostId = async (postId) => {
        return await this.commentRepository.findByPostId(postId);
    }

    getCommentCountByPostId = async (postId) => {
        return await this.commentRepository.countByPostId(postId);
    }
}

