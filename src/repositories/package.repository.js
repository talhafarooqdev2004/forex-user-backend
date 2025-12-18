import models from '../models/index.js';

export default class PackageRepository {
    all = async (locale) => {
        return await models.SubscriptionPackage.findAll({
            where: { publish: true },
            include: [
                {
                    model: models.SubscriptionPackageTranslation,
                    as: 'translation',
                    where: locale ? { locale } : undefined,
                    required: false,
                }
            ]
        });
    };

    findById = async (id, locale) => {
        return await models.SubscriptionPackage.findByPk(id, {
            include: [
                {
                    model: models.SubscriptionPackageTranslation,
                    as: 'translation',
                    where: locale ? { locale } : undefined,
                    required: false,
                }
            ]
        });
    };
}
