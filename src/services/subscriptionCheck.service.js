import UserSubscriptionRepository from '../repositories/userSubscription.repository.js';

export default class SubscriptionCheckService {
    constructor() {
        this.subscriptionRepository = new UserSubscriptionRepository();
    }

    /**
     * Check if user has active subscription
     */
    async hasActiveSubscription(userId) {
        try {
            const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
            if (!subscription) {
                return false;
            }

            // Check if subscription is still valid
            const now = new Date();
            const endDate = new Date(subscription.end_date);
            const startDate = new Date(subscription.start_date);
            
            return subscription.status === 'active' && startDate <= now && endDate >= now;
        } catch (error) {
            console.error('SubscriptionCheckService.hasActiveSubscription error:', error);
            return false;
        }
    }

    /**
     * Get user's active subscription
     */
    async getActiveSubscription(userId) {
        try {
            return await this.subscriptionRepository.findActiveByUserId(userId);
        } catch (error) {
            console.error('SubscriptionCheckService.getActiveSubscription error:', error);
            return null;
        }
    }

    /**
     * Get all user subscriptions
     */
    async getUserSubscriptions(userId) {
        try {
            return await this.subscriptionRepository.findByUserId(userId);
        } catch (error) {
            console.error('SubscriptionCheckService.getUserSubscriptions error:', error);
            return [];
        }
    }
}

