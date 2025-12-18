import express from "express";
import PostController from "../../controllers/v1/forum/post.controller.js";

const router = express.Router();

const postController = new PostController();

router.get(
    '/',
    postController.index
);

router.get(
    '/get',
    postController.getPostBySlug
);

export default router;