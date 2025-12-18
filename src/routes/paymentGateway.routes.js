import express from 'express';
import PaymentGatewayController from '../controllers/v1/paymentGateway.controller.js';

const router = express.Router();
const paymentGatewayController = new PaymentGatewayController();

router.get(
    '/active',
    paymentGatewayController.getActive,
);

export default router;

