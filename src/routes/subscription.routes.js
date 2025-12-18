import express from 'express';
import SubscriptionController from '../controllers/v1/subscription.controller.js';
// import { authenticate } from '../middlewares/auth.middleware.js'; // Uncomment when auth is ready

const router = express.Router();
const subscriptionController = new SubscriptionController();

router.get(
    '/active',
    // authenticate, // Uncomment when auth is ready
    subscriptionController.getActiveSubscription,
);

router.get(
    '/',
    // authenticate, // Uncomment when auth is ready
    subscriptionController.getUserSubscriptions,
);

router.get(
    '/check',
    // authenticate, // Uncomment when auth is ready
    subscriptionController.checkActiveSubscription,
);

export default router;

