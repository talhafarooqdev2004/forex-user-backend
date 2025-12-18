import SubscriptionCheckService from '../../services/subscriptionCheck.service.js';
import { successResponse } from '@/utils/response.util.js';

export default class SubscriptionController {
    constructor() {
        this.subscriptionService = new SubscriptionCheckService();
    }

    /**
     * Get user's active subscription
     * GET /subscriptions/active
     */
    getActiveSubscription = async (req, res, next) => {
        try {
            const userId = req.user?.id || req.query.userId; // TODO: Get from auth middleware

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const subscription = await this.subscriptionService.getActiveSubscription(userId);

            return res.status(200).json(
                successResponse('Active subscription retrieved successfully.', subscription)
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all user subscriptions
     * GET /subscriptions
     */
    getUserSubscriptions = async (req, res, next) => {
        try {
            const userId = req.user?.id || req.query.userId; // TODO: Get from auth middleware

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const subscriptions = await this.subscriptionService.getUserSubscriptions(userId);

            return res.status(200).json(
                successResponse('User subscriptions retrieved successfully.', subscriptions)
            );
        } catch (error) {
            next(error);
        }
    };

    /**
     * Check if user has active subscription
     * GET /subscriptions/check
     */
    checkActiveSubscription = async (req, res, next) => {
        try {
            const userId = req.user?.id || req.query.userId; // TODO: Get from auth middleware

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            const hasActive = await this.subscriptionService.hasActiveSubscription(userId);

            return res.status(200).json(
                successResponse('Subscription status checked successfully.', {
                    hasActiveSubscription: hasActive
                })
            );
        } catch (error) {
            next(error);
        }
    };
}

