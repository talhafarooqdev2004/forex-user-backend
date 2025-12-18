import express from 'express';
import userRoutes from './user.routes.js';
import packageRoutes from './package.routes.js';
import forumTopicRoutes from './forum/topic.routes.js';
import forumPostRoutes from './forum/post.routes.js';
import forumCommentRoutes from './forum/comment.routes.js';
import educationRoutes from './education.routes.js';
import pageContentRoutes from './pageContent.routes.js';
import paymentGatewayRoutes from './paymentGateway.routes.js';
import paymentRoutes from './payment.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import healthRoutes from './health.js';
import sseRoutes from './sse.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/packages', packageRoutes);
router.use('/forum-topics', forumTopicRoutes);
router.use('/forum-posts', forumPostRoutes);
router.use('/forum-comments', forumCommentRoutes);
router.use('/educations', educationRoutes);
router.use('/page-contents', pageContentRoutes);
router.use('/payment-gateways', paymentGatewayRoutes);
router.use('/payments', paymentRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/health', healthRoutes);
router.use('/sse', sseRoutes);

export default router;