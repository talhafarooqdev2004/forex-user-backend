import PageContentService from '../../services/pageContent.service.js';
import {
    successResponse
} from '../../utils/response.util.js';
import {
    cacheRemember
} from '../../utils/cache.util.js';
import {
    PageContentResponseDTO
} from '../../dtos/pageContent/response/pageContent.response.dto.js';

class PageContentController {
    async getByPageIdentifier(req, res, next) {
        try {
            const {
                pageIdentifier
            } = req.params;
            const {
                locale
            } = req.query;

            if (!locale) {
                return res.status(400).json({
                    error: "Locale is required!"
                });
            }

            const cacheKey = `page-content:${pageIdentifier}:${locale}`;
            const pageContent = await cacheRemember(cacheKey, 3600, async () => {
                const data = await PageContentService.getByPageIdentifier(pageIdentifier, locale);
                return data.map(item => PageContentResponseDTO.fromModel(item));
            });

            return res
                .status(200)
                .json(successResponse(`${pageIdentifier} page content retrieved successfully.`, pageContent));
        } catch (err) {
            next(err);
        }
    }
}

export default new PageContentController();

