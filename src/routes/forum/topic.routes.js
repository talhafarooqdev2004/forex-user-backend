import express from 'express';
import TopicController from '../../controllers/v1/forum/topic.controller.js';

const router = express.Router();

const topicController = new TopicController();

router.get(
    '/',
    topicController.index
);

export default router;