import Stripe from 'stripe';
import PaymentGatewayService from '../paymentGateway.service.js';

export default class StripeService {
    constructor() {
        this.paymentGatewayService = new PaymentGatewayService();
        this.stripe = null;
    }

    async getStripeInstance() {
        if (this.stripe) {
            return this.stripe;
        }

        const gateway = await this.paymentGatewayService.getGatewayByName('stripe');
        if (!gateway || !(gateway.isActive || gateway.is_active)) {
            throw new Error('Stripe gateway is not active');
        }

        const credentials = gateway.credentials || {};
        const secretKey = credentials.secret_key || credentials.secretKey;

        if (!secretKey) {
            // Return null to indicate test mode (will use mock)
            return null;
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-11-20.acacia',
        });

        return this.stripe;
    }

    async createPaymentIntent(amount, currency, metadata = {}) {
        try {
            const stripe = await this.getStripeInstance();

            // If no API key, return mock response for testing
            if (!stripe) {
                return {
                    clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
                    id: `pi_mock_${Date.now()}`,
                    status: 'requires_payment_method',
                    mock: true,
                };
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id,
                status: paymentIntent.status,
                mock: false,
            };
        } catch (error) {
            console.error('Stripe createPaymentIntent error:', error);
            throw new Error(`Stripe payment intent creation failed: ${error.message}`);
        }
    }

    async confirmPaymentIntent(paymentIntentId) {
        try {
            const stripe = await this.getStripeInstance();
            if (!stripe) {
                throw new Error('Stripe is not configured');
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Stripe confirmPaymentIntent error:', error);
            throw error;
        }
    }

    async verifyWebhookSignature(payload, signature, webhookSecret) {
        try {
            const stripe = await this.getStripeInstance();
            if (!stripe) {
                throw new Error('Stripe is not configured');
            }

            return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (error) {
            console.error('Stripe webhook verification error:', error);
            throw error;
        }
    }
}

