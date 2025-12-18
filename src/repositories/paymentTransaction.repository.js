import models from '../models/index.js';

export default class PaymentTransactionRepository {
    create = async (data) => {
        return await models.PaymentTransaction.create({
            user_id: data.userId,
            package_id: data.packageId,
            payment_gateway_id: data.paymentGatewayId,
            transaction_id: data.transactionId,
            amount: data.amount,
            currency: data.currency,
            status: data.status || 'pending',
            gateway_response: data.gatewayResponse,
            failure_reason: data.failureReason,
            completed_at: data.completedAt,
        });
    };

    findByTransactionId = async (transactionId) => {
        return await models.PaymentTransaction.findOne({
            where: { transaction_id: transactionId }
        });
    };

    updateStatus = async (transactionId, status, gatewayResponse = null, failureReason = null) => {
        const updateData = {
            status,
            ...(gatewayResponse && { gateway_response: gatewayResponse }),
            ...(failureReason && { failure_reason: failureReason }),
            ...(status === 'completed' && { completed_at: new Date() }),
        };

        return await models.PaymentTransaction.update(updateData, {
            where: { transaction_id: transactionId }
        });
    };

    findById = async (id) => {
        return await models.PaymentTransaction.findByPk(id, {
            include: [
                { model: models.User, as: 'user' },
                { model: models.SubscriptionPackage, as: 'package' },
                { model: models.PaymentGateway, as: 'paymentGateway' },
            ]
        });
    };
}

