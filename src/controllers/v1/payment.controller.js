import PaymentGatewayService from '../../services/paymentGateway.service.js';
import StripeService from '../../services/payment/stripe.service.js';
import PayPalService from '../../services/payment/paypal.service.js';
import JazzCashService from '../../services/payment/jazzcash.service.js';
import PaymentTransactionRepository from '../../repositories/paymentTransaction.repository.js';
import SubscriptionService from '../../services/subscription.service.js';
import { successResponse } from '@/utils/response.util.js';

export default class PaymentController {
    constructor() {
        this.paymentGatewayService = new PaymentGatewayService();
        this.stripeService = new StripeService();
        this.paypalService = new PayPalService();
        this.jazzcashService = new JazzCashService();
        this.transactionRepository = new PaymentTransactionRepository();
        this.subscriptionService = new SubscriptionService();
    }

    /**
     * Create payment intent for Stripe
     * POST /payments/stripe/create-intent
     */
    createStripeIntent = async (req, res, next) => {
        try {
            const { packageId, amount, currency = 'USD', userId } = req.body;
            // TODO: Get userId from auth middleware when ready
            // For now, accept it from request body
            const finalUserId = req.user?.id || userId;

            if (!packageId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Package ID and amount are required'
                });
            }

            if (!finalUserId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required. Please login to proceed with payment.'
                });
            }

            // Get Stripe gateway configuration
            const stripeGateway = await this.paymentGatewayService.getGatewayByName('stripe');
            if (!stripeGateway || !(stripeGateway.isActive || stripeGateway.is_active)) {
                return res.status(400).json({
                    success: false,
                    message: 'Stripe payment gateway is not available'
                });
            }

            // Create payment intent
            const paymentIntent = await this.stripeService.createPaymentIntent(
                parseFloat(amount),
                currency,
                {
                    packageId: packageId.toString(),
                    userId: userId.toString(),
                }
            );

            // Create transaction record
            const transaction = await this.transactionRepository.create({
                userId: finalUserId,
                packageId: parseInt(packageId),
                paymentGatewayId: stripeGateway.id,
                transactionId: paymentIntent.id,
                amount: parseFloat(amount),
                currency,
                status: 'pending',
                gatewayResponse: paymentIntent,
            });

            return res.status(200).json(
                successResponse('Payment intent created successfully.', {
                    clientSecret: paymentIntent.clientSecret,
                    transactionId: transaction.id,
                    paymentIntentId: paymentIntent.id,
                    gateway: 'stripe',
                    amount,
                    currency,
                    mock: paymentIntent.mock || false,
                })
            );
        } catch (error) {
            console.error('createStripeIntent error:', error);
            next(error);
        }
    };

    /**
     * Create PayPal order
     * POST /payments/paypal/create-order
     */
    createPayPalOrder = async (req, res, next) => {
        try {
            const { packageId, amount, currency = 'USD', userId } = req.body;
            const finalUserId = req.user?.id || userId; // TODO: Get from auth middleware

            if (!finalUserId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required. Please login to proceed with payment.'
                });
            }

            if (!packageId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Package ID and amount are required'
                });
            }

            // Get PayPal gateway configuration
            const paypalGateway = await this.paymentGatewayService.getGatewayByName('paypal');
            if (!paypalGateway || !(paypalGateway.isActive || paypalGateway.is_active)) {
                return res.status(400).json({
                    success: false,
                    message: 'PayPal payment gateway is not available'
                });
            }

            // Create PayPal order
            const order = await this.paypalService.createOrder(
                parseFloat(amount),
                currency,
                {
                    packageId: packageId.toString(),
                    userId: finalUserId.toString(),
                }
            );

            // Create transaction record
            const transaction = await this.transactionRepository.create({
                userId: finalUserId,
                packageId: parseInt(packageId),
                paymentGatewayId: paypalGateway.id,
                transactionId: order.id,
                amount: parseFloat(amount),
                currency,
                status: 'pending',
                gatewayResponse: order,
            });

            return res.status(200).json(
                successResponse('PayPal order created successfully.', {
                    orderId: order.id,
                    transactionId: transaction.id,
                    gateway: 'paypal',
                    amount,
                    currency,
                    mock: order.mock || false,
                })
            );
        } catch (error) {
            console.error('createPayPalOrder error:', error);
            next(error);
        }
    };

    /**
     * Create JazzCash payment request
     * POST /payments/jazzcash/create-request
     */
    createJazzCashRequest = async (req, res, next) => {
        try {
            const { packageId, amount, currency = 'PKR', userId } = req.body;
            const finalUserId = req.user?.id || userId; // TODO: Get from auth middleware

            if (!finalUserId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required. Please login to proceed with payment.'
                });
            }

            if (!packageId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Package ID and amount are required'
                });
            }

            // Get JazzCash gateway configuration
            const jazzcashGateway = await this.paymentGatewayService.getGatewayByName('jazzcash');
            if (!jazzcashGateway || !(jazzcashGateway.isActive || jazzcashGateway.is_active)) {
                return res.status(400).json({
                    success: false,
                    message: 'JazzCash payment gateway is not available'
                });
            }

            // Create JazzCash payment request
            const paymentRequest = await this.jazzcashService.createPaymentRequest(
                parseFloat(amount),
                currency,
                {
                    packageId: packageId.toString(),
                    userId: finalUserId.toString(),
                    description: 'Package Subscription',
                }
            );

            // Create transaction record
            const transaction = await this.transactionRepository.create({
                userId: finalUserId,
                packageId: parseInt(packageId),
                paymentGatewayId: jazzcashGateway.id,
                transactionId: paymentRequest.requestId,
                amount: parseFloat(amount),
                currency,
                status: 'pending',
                gatewayResponse: paymentRequest,
            });

            return res.status(200).json(
                successResponse('JazzCash payment request created successfully.', {
                    requestId: paymentRequest.requestId,
                    transactionId: transaction.id,
                    gateway: 'jazzcash',
                    amount,
                    currency,
                    redirectUrl: paymentRequest.redirectUrl,
                    formData: paymentRequest.formData,
                    mock: paymentRequest.mock || false,
                })
            );
        } catch (error) {
            console.error('createJazzCashRequest error:', error);
            next(error);
        }
    };

    /**
     * Confirm Stripe payment
     * POST /payments/stripe/confirm
     */
    confirmStripePayment = async (req, res, next) => {
        try {
            const { paymentIntentId } = req.body;
            const userId = req.user?.id || 1; // TODO: Get from auth middleware

            if (!paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment intent ID is required'
                });
            }

            // Find transaction
            const transaction = await this.transactionRepository.findByTransactionId(paymentIntentId);
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Verify payment with Stripe
            try {
                const paymentIntent = await this.stripeService.confirmPaymentIntent(paymentIntentId);
                
                if (paymentIntent.status === 'succeeded') {
                    // Update transaction status
                    await this.transactionRepository.updateStatus(
                        paymentIntentId,
                        'completed',
                        paymentIntent
                    );

                    // Create subscription
                    const subscription = await this.subscriptionService.createSubscription(
                        transaction.user_id,
                        transaction.package_id,
                        transaction.id
                    );

                    return res.status(200).json(
                        successResponse('Payment confirmed successfully.', {
                            transactionId: transaction.id,
                            subscriptionId: subscription.id,
                            status: 'completed',
                        })
                    );
                } else {
                    await this.transactionRepository.updateStatus(
                        paymentIntentId,
                        'failed',
                        paymentIntent,
                        `Payment status: ${paymentIntent.status}`
                    );

                    return res.status(400).json({
                        success: false,
                        message: `Payment not completed. Status: ${paymentIntent.status}`
                    });
                }
            } catch (stripeError) {
                // If Stripe is not configured, simulate success for testing
                if (stripeError.message.includes('not configured') || stripeError.message.includes('Stripe')) {
                    await this.transactionRepository.updateStatus(
                        paymentIntentId,
                        'completed',
                        { mock: true, message: 'Mock payment confirmation' }
                    );

                    const subscription = await this.subscriptionService.createSubscription(
                        transaction.user_id,
                        transaction.package_id,
                        transaction.id
                    );

                    return res.status(200).json(
                        successResponse('Payment confirmed successfully (test mode).', {
                            transactionId: transaction.id,
                            subscriptionId: subscription.id,
                            status: 'completed',
                            mock: true,
                        })
                    );
                }
                throw stripeError;
            }
        } catch (error) {
            console.error('confirmStripePayment error:', error);
            next(error);
        }
    };

    /**
     * Handle payment webhook/callback
     * POST /payments/webhook/:gateway
     */
    handleWebhook = async (req, res, next) => {
        try {
            const { gateway } = req.params;
            const signature = req.headers['stripe-signature'] || req.headers['paypal-transmission-sig'] || null;
            const rawBody = req.rawBody || JSON.stringify(req.body);

            if (gateway === 'stripe') {
                return await this.handleStripeWebhook(req, res, next, signature, rawBody);
            } else if (gateway === 'paypal') {
                return await this.handlePayPalWebhook(req, res, next, signature);
            } else if (gateway === 'jazzcash') {
                return await this.handleJazzCashCallback(req, res, next);
            }

            return res.status(400).json({
                success: false,
                message: 'Unknown payment gateway'
            });
        } catch (error) {
            console.error('handleWebhook error:', error);
            next(error);
        }
    };

    handleStripeWebhook = async (req, res, next, signature, rawBody) => {
        try {
            const stripeGateway = await this.paymentGatewayService.getGatewayByName('stripe');
            const webhookSecret = stripeGateway?.credentials?.webhook_secret || stripeGateway?.credentials?.webhookSecret;

            if (!webhookSecret) {
                // In test mode, process without verification
                const event = req.body;
                return await this.processStripeEvent(event, res);
            }

            // Verify webhook signature
            const event = await this.stripeService.verifyWebhookSignature(
                rawBody,
                signature,
                webhookSecret
            );

            return await this.processStripeEvent(event, res);
        } catch (error) {
            console.error('Stripe webhook error:', error);
            return res.status(400).json({
                success: false,
                message: `Webhook verification failed: ${error.message}`
            });
        }
    };

    processStripeEvent = async (event, res) => {
        try {
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                const transaction = await this.transactionRepository.findByTransactionId(paymentIntent.id);

                if (transaction && transaction.status === 'pending') {
                    await this.transactionRepository.updateStatus(
                        paymentIntent.id,
                        'completed',
                        paymentIntent
                    );

                    // Create subscription
                    await this.subscriptionService.createSubscription(
                        transaction.user_id,
                        transaction.package_id,
                        transaction.id
                    );
                }
            } else if (event.type === 'payment_intent.payment_failed') {
                const paymentIntent = event.data.object;
                await this.transactionRepository.updateStatus(
                    paymentIntent.id,
                    'failed',
                    paymentIntent,
                    paymentIntent.last_payment_error?.message || 'Payment failed'
                );
            }

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('processStripeEvent error:', error);
            throw error;
        }
    };

    handlePayPalWebhook = async (req, res, next, signature) => {
        try {
            // TODO: Implement PayPal webhook verification and processing
            const event = req.body;
            console.log('PayPal webhook received:', event);

            // For now, return success
            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('PayPal webhook error:', error);
            next(error);
        }
    };

    handleJazzCashCallback = async (req, res, next) => {
        try {
            const callbackData = req.body;
            const jazzcashGateway = await this.paymentGatewayService.getGatewayByName('jazzcash');
            const integritySalt = jazzcashGateway?.credentials?.integrity_salt || jazzcashGateway?.credentials?.integritySalt;

            if (!integritySalt) {
                return res.status(400).json({
                    success: false,
                    message: 'JazzCash not configured'
                });
            }

            // Verify callback signature
            const isValid = this.jazzcashService.verifyCallback(callbackData, integritySalt);
            if (!isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid callback signature'
                });
            }

            const transaction = await this.transactionRepository.findByTransactionId(callbackData.pp_TxnRefNo);
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            if (callbackData.pp_ResponseCode === '000') {
                // Payment successful
                await this.transactionRepository.updateStatus(
                    callbackData.pp_TxnRefNo,
                    'completed',
                    callbackData
                );

                await this.subscriptionService.createSubscription(
                    transaction.user_id,
                    transaction.package_id,
                    transaction.id
                );

                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/payment/success?transactionId=${transaction.id}`);
            } else {
                // Payment failed
                await this.transactionRepository.updateStatus(
                    callbackData.pp_TxnRefNo,
                    'failed',
                    callbackData,
                    callbackData.pp_ResponseMessage || 'Payment failed'
                );

                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/payment/failure?transactionId=${transaction.id}`);
            }
        } catch (error) {
            console.error('JazzCash callback error:', error);
            next(error);
        }
    };
}

