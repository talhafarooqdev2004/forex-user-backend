import models from '../models/index.js';
import { Op } from 'sequelize';

export default class UserSubscriptionRepository {
    create = async (data) => {
        return await models.UserSubscription.create({
            user_id: data.userId,
            package_id: data.packageId,
            payment_transaction_id: data.paymentTransactionId,
            start_date: data.startDate,
            end_date: data.endDate,
            status: data.status || 'active',
            cancelled_at: data.cancelledAt,
            cancellation_reason: data.cancellationReason,
        });
    };

    findActiveByUserId = async (userId) => {
        return await models.UserSubscription.findOne({
            where: {
                user_id: userId,
                status: 'active',
            },
            include: [
                { model: models.SubscriptionPackage, as: 'package' },
                { model: models.PaymentTransaction, as: 'paymentTransaction' },
            ],
            order: [['end_date', 'DESC']],
        });
    };

    findByUserId = async (userId) => {
        return await models.UserSubscription.findAll({
            where: { user_id: userId },
            include: [
                { model: models.SubscriptionPackage, as: 'package' },
                { model: models.PaymentTransaction, as: 'paymentTransaction' },
            ],
            order: [['created_at', 'DESC']],
        });
    };

    cancel = async (subscriptionId, reason = null) => {
        return await models.UserSubscription.update(
            {
                status: 'cancelled',
                cancelled_at: new Date(),
                cancellation_reason: reason,
            },
            {
                where: { id: subscriptionId }
            }
        );
    };

    expireOldSubscriptions = async () => {
        const { Op } = require('sequelize');
        return await models.UserSubscription.update(
            { status: 'expired' },
            {
                where: {
                    status: 'active',
                    end_date: { [Op.lt]: new Date() }
                }
            }
        );
    };
}

