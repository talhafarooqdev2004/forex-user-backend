import express from 'express';
import PaymentController from '../controllers/v1/payment.controller.js';
// import { authenticate } from '../middlewares/auth.middleware.js'; // Uncomment when auth is ready

const router = express.Router();
const paymentController = new PaymentController();

// Stripe routes
router.post(
    '/stripe/create-intent',
    // authenticate, // Uncomment when auth is ready
    paymentController.createStripeIntent,
);

// PayPal routes
router.post(
    '/paypal/create-order',
    // authenticate, // Uncomment when auth is ready
    paymentController.createPayPalOrder,
);

// JazzCash routes
router.post(
    '/jazzcash/create-request',
    // authenticate, // Uncomment when auth is ready
    paymentController.createJazzCashRequest,
);

// Payment confirmation
router.post(
    '/stripe/confirm',
    // authenticate, // Uncomment when auth is ready
    paymentController.confirmStripePayment,
);

// Webhook routes (no auth required, but signature verification)
// Note: For Stripe webhooks, you need to use express.raw() middleware
// This should be configured in app.js for the webhook route specifically
router.post(
    '/webhook/:gateway',
    paymentController.handleWebhook,
);

export default router;

