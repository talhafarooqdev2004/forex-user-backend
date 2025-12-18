import PaymentGatewayRepository from '../repositories/paymentGateway.repository.js';
import { cacheRemember } from '../utils/cache.util.js';

export default class PaymentGatewayService {
    constructor() {
        this.paymentGatewayRepository = new PaymentGatewayRepository();
    }

    getActiveGateways = async () => {
        const cacheKey = 'payment_gateways:active';
        try {
            return await cacheRemember(cacheKey, 3600, async () => {
                return await this.paymentGatewayRepository.findActive();
            });
        } catch (error) {
            console.error('PaymentGatewayService.getActiveGateways error:', error);
            throw error;
        }
    };

    getAllGateways = async () => {
        const cacheKey = 'payment_gateways:all';
        return await cacheRemember(cacheKey, 3600, async () => {
            return await this.paymentGatewayRepository.all();
        });
    };

    getGatewayByName = async (name) => {
        return await this.paymentGatewayRepository.findByName(name);
    };
}

