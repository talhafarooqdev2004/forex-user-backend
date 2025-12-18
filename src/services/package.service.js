import PackageRepository from "../repositories/package.repository.js";

export default class PackageService {
    constructor() {
        this.packageRepository = new PackageRepository();
    }

    getPackages = async (locale) => {
        return await this.packageRepository.all(locale);
    };

    getPackageById = async (id, locale) => {
        return await this.packageRepository.findById(id, locale);
    };
}