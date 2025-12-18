import express from "express";
import CommentController from "@/controllers/v1/forum/comment.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = express.Router();

const commentController = new CommentController();

// Get comments by post ID (public)
router.get(
    '/post/:postId',
    commentController.getByPostId
);

// Get comment count by post ID (public)
router.get(
    '/post/:postId/count',
    commentController.getCountByPostId
);

// Create comment (protected - requires authentication)
router.post(
    '/',
    authMiddleware,
    commentController.create
);

export default router;

