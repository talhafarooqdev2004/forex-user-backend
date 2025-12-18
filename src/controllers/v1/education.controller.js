import EducationService from "../../services/education.service.js";
import { successResponse } from "../../utils/response.util.js";
import { cacheRemember } from "../../utils/cache.util.js";
import { EducationIndexResponseDTO } from "../../dtos/education/response/education.response.dto.js";

export default class EducationController {
    constructor() {
        this.educationService = new EducationService();
    }

    index = async (req, res, next) => {
        try {
            const { locale } = req.query;

            if (!locale) {
                return res.status(400).json({ error: "Locale is required!" });
            }

            const cacheKey = `education:all:${locale}`;

            const cachedData = await cacheRemember(cacheKey, 3600, async () => {
                const educations = await this.educationService.getAll(locale);

                if (!educations || educations.length === 0) {
                    return [];
                }

                return educations.map(e => EducationIndexResponseDTO.fromModel(e));
            });

            return res
                .status(200)
                .json(successResponse('Educations retrieved successfully.', cachedData));
        } catch (error) {
            next(error);
        }
    }

    show = async (req, res, next) => {
        try {
            const locale = req.query.locale
                ?? req.headers['accept-language']
                ?? process.env.APP_LOCALE;
            const slug = req.query.slug ?? "";

            if (!slug) {
                return res.status(400).json({ error: "Slug is required!" });
            }

            if (!locale) {
                return res.status(400).json({ error: "Locale is required!" });
            }

            const cacheKey = `education:${slug}:${locale}`;

            const cachedData = await cacheRemember(cacheKey, 3600, async () => {
                const education = await this.educationService.getBySlug(locale, slug);

                if (!education) {
                    return null;
                }

                return EducationIndexResponseDTO.fromModel(education);
            });

            if (!cachedData) {
                return res.status(404).json({ error: "Education not found!" });
            }

            return res
                .status(200)
                .json(successResponse('Education retrieved successfully.', cachedData));
        } catch (error) {
            next(error);
        }
    }
}