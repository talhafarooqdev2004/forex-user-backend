import PaymentGatewayService from '../../services/paymentGateway.service.js';
import { successResponse } from '@/utils/response.util.js';

export default class PaymentGatewayController {
    constructor() {
        this.paymentGatewayService = new PaymentGatewayService();
    }

    getActive = async (req, res, next) => {
        try {
            const gateways = await this.paymentGatewayService.getActiveGateways();

            const response = gateways.map(g => ({
                id: g.id,
                name: g.name,
                display_name: g.displayName || g.display_name,
                description: g.description,
                icon: g.icon,
                settings: g.settings,
                // Don't expose credentials to frontend
            }));

            return res.status(200).json(
                successResponse('Active payment gateways retrieved successfully.', response)
            );
        } catch (error) {
            console.error('PaymentGatewayController.getActive error:', error);
            next(error);
        }
    };
}

