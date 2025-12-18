import UserSubscriptionRepository from '../repositories/userSubscription.repository.js';
import PaymentTransactionRepository from '../repositories/paymentTransaction.repository.js';
import models from '../models/index.js';

export default class SubscriptionService {
    constructor() {
        this.subscriptionRepository = new UserSubscriptionRepository();
        this.transactionRepository = new PaymentTransactionRepository();
    }

    async createSubscription(userId, packageId, paymentTransactionId) {
        try {
            // Get package details
            const packageData = await models.SubscriptionPackage.findByPk(packageId);
            if (!packageData) {
                throw new Error('Package not found');
            }

            // Calculate subscription dates
            const startDate = new Date();
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + packageData.duration_hours);

            // Create subscription
            const subscription = await this.subscriptionRepository.create({
                userId,
                packageId,
                paymentTransactionId,
                startDate,
                endDate,
                status: 'active',
            });

            return subscription;
        } catch (error) {
            console.error('SubscriptionService.createSubscription error:', error);
            throw error;
        }
    }

    async getUserActiveSubscription(userId) {
        try {
            return await this.subscriptionRepository.findActiveByUserId(userId);
        } catch (error) {
            console.error('SubscriptionService.getUserActiveSubscription error:', error);
            throw error;
        }
    }

    async hasActiveSubscription(userId) {
        try {
            const subscription = await this.getUserActiveSubscription(userId);
            if (!subscription) {
                return false;
            }

            // Check if subscription is still valid
            const now = new Date();
            const endDate = new Date(subscription.end_date);
            const startDate = new Date(subscription.start_date);
            
            return subscription.status === 'active' && startDate <= now && endDate >= now;
        } catch (error) {
            console.error('SubscriptionService.hasActiveSubscription error:', error);
            return false;
        }
    }

    async getUserSubscriptions(userId) {
        try {
            return await this.subscriptionRepository.findByUserId(userId);
        } catch (error) {
            console.error('SubscriptionService.getUserSubscriptions error:', error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId, reason = null) {
        try {
            return await this.subscriptionRepository.cancel(subscriptionId, reason);
        } catch (error) {
            console.error('SubscriptionService.cancelSubscription error:', error);
            throw error;
        }
    }
}

