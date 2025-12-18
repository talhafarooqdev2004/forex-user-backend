import crypto from 'crypto';
import PaymentGatewayService from '../paymentGateway.service.js';

export default class JazzCashService {
    constructor() {
        this.paymentGatewayService = new PaymentGatewayService();
    }

    async getJazzCashConfig() {
        const gateway = await this.paymentGatewayService.getGatewayByName('jazzcash');
        if (!gateway || !(gateway.isActive || gateway.is_active)) {
            throw new Error('JazzCash gateway is not active');
        }

        const credentials = gateway.credentials || {};
        const settings = gateway.settings || {};
        const isTestMode = settings.test_mode !== false;

        return {
            merchantId: credentials.merchant_id || credentials.merchantId,
            password: credentials.password,
            integritySalt: credentials.integrity_salt || credentials.integritySalt,
            environment: isTestMode ? 'sandbox' : 'production',
            hasCredentials: !!(credentials.merchant_id || credentials.merchantId),
        };
    }

    generateHash(ppAmount, ppBillReference, ppDescription, ppTxnDateTime, ppTxnExpiryDateTime, ppTxnRefNo, ppTxnType, merchantId, password, integritySalt) {
        const hashString = `${integritySalt}&${ppAmount}&${ppBillReference}&${ppDescription}&${ppTxnDateTime}&${ppTxnExpiryDateTime}&${ppTxnRefNo}&${ppTxnType}&${merchantId}&${password}&${integritySalt}`;
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }

    async createPaymentRequest(amount, currency, metadata = {}) {
        try {
            const config = await this.getJazzCashConfig();

            // If no API keys, return mock response for testing
            if (!config.hasCredentials) {
                return {
                    requestId: `JAZZ-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    redirectUrl: '/payment/jazzcash/mock-redirect',
                    mock: true,
                };
            }

            // Generate transaction reference
            const ppTxnRefNo = `TXN${Date.now()}${Math.random().toString(36).substring(7)}`;
            const ppTxnDateTime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
            const ppTxnExpiryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0];
            const ppAmount = amount.toString();
            const ppBillReference = metadata.packageId?.toString() || 'PACKAGE';
            const ppDescription = metadata.description || 'Package Subscription';
            const ppTxnType = 'MWALLET';

            // Generate hash
            const ppSecureHash = this.generateHash(
                ppAmount,
                ppBillReference,
                ppDescription,
                ppTxnDateTime,
                ppTxnExpiryDateTime,
                ppTxnRefNo,
                ppTxnType,
                config.merchantId,
                config.password,
                config.integritySalt
            );

            // JazzCash payment URL
            const baseUrl = config.environment === 'sandbox'
                ? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform'
                : 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform';

            return {
                requestId: ppTxnRefNo,
                redirectUrl: baseUrl,
                formData: {
                    pp_Amount: ppAmount,
                    pp_BillReference: ppBillReference,
                    pp_Description: ppDescription,
                    pp_IsRegisteredCustomer: 'No',
                    pp_Language: 'EN',
                    pp_MerchantID: config.merchantId,
                    pp_Password: config.password,
                    pp_ReturnURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/packages/payment/callback?gateway=jazzcash`,
                    pp_SubMerchantID: '',
                    pp_TxnDateTime: ppTxnDateTime,
                    pp_TxnExpiryDateTime: ppTxnExpiryDateTime,
                    pp_TxnRefNo: ppTxnRefNo,
                    pp_TxnType: ppTxnType,
                    pp_Version: '1.1',
                    pp_SecureHash: ppSecureHash,
                },
                mock: false,
            };
        } catch (error) {
            console.error('JazzCash createPaymentRequest error:', error);
            throw new Error(`JazzCash payment request creation failed: ${error.message}`);
        }
    }

    verifyCallback(data, integritySalt) {
        try {
            const {
                pp_Amount,
                pp_BillReference,
                pp_Description,
                pp_TxnDateTime,
                pp_TxnExpiryDateTime,
                pp_TxnRefNo,
                pp_TxnType,
                pp_MerchantID,
                pp_Password,
                pp_ResponseCode,
                pp_ResponseMessage,
                pp_SecureHash,
            } = data;

            const hashString = `${integritySalt}&${pp_Amount}&${pp_BillReference}&${pp_Description}&${pp_TxnDateTime}&${pp_TxnExpiryDateTime}&${pp_TxnRefNo}&${pp_TxnType}&${pp_MerchantID}&${pp_Password}&${pp_ResponseCode}&${pp_ResponseMessage}&${integritySalt}`;
            const calculatedHash = crypto.createHash('sha256').update(hashString).digest('hex');

            return calculatedHash === pp_SecureHash;
        } catch (error) {
            console.error('JazzCash verifyCallback error:', error);
            return false;
        }
    }
}

