import { PackageIndexResponseDTO } from "../../dtos/Package/response/package.response.dto.js";
import PackageService from "../../services/package.service.js";
import { successResponse } from '@/utils/response.util.js';

export default class PackageController {
    constructor() {
        this.packageService = new PackageService();
    }

    index = async (req, res, next) => {
        try {
            const locale = req.query.locale
                ?? req.headers['accept-language']
                ?? process.env.APP_LOCALE;

            const packages = await this.packageService.getPackages(locale);

            const response = packages.map(p => PackageIndexResponseDTO.fromModel(p));

            return res.status(200).json(
                successResponse('Packages retrieved successfully.', response)
            );
        } catch (error) {
            next(error);
        }
    }

    show = async (req, res, next) => {
        try {
            const { id } = req.params;
            const locale = req.query.locale
                ?? req.headers['accept-language']
                ?? process.env.APP_LOCALE;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Package ID is required'
                });
            }

            const packageData = await this.packageService.getPackageById(parseInt(id), locale);

            if (!packageData) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            const response = PackageIndexResponseDTO.fromModel(packageData);

            return res.status(200).json(
                successResponse('Package retrieved successfully.', response)
            );
        } catch (error) {
            next(error);
        }
    }
}