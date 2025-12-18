import EducationRepository from "../repositories/education.repository.js"

export default class EducationService {
    constructor() {
        this.educationRepository = new EducationRepository();
    }

    getAll = async (locale) => {
        return await this.educationRepository.all(locale);
    }

    getBySlug = async (locale, slug) => {
        return await this.educationRepository.findBySlug(locale, slug);
    }
}