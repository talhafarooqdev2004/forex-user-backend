import models from '../models/index.js';

export default class PaymentGatewayRepository {
    all = async () => {
        try {
            return await models.PaymentGateway.findAll({
                order: [['displayOrder', 'ASC']],
                raw: false
            });
        } catch (error) {
            console.error('PaymentGatewayRepository.all error:', error);
            throw error;
        }
    };

    findActive = async () => {
        try {
            const result = await models.PaymentGateway.findAll({
                where: { isActive: true },
                order: [['displayOrder', 'ASC']],
                raw: false
            });
            return result;
        } catch (error) {
            console.error('PaymentGatewayRepository.findActive error:', error);
            console.error('Error details:', error.message, error.stack);
            throw error;
        }
    };

    findByName = async (name) => {
        return await models.PaymentGateway.findOne({
            where: { name }
        });
    };

    findById = async (id) => {
        return await models.PaymentGateway.findByPk(id);
    };
}

