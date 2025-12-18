import PageContentRepository from '../repositories/pageContent.repository.js';

class PageContentService {
    async getByPageIdentifier(pageIdentifier, locale) {
        return PageContentRepository.findByPageIdentifier(pageIdentifier, locale);
    }
}

export default new PageContentService();

