class PageContentTranslationResponseDTO {
    constructor(translation) {
        this.id = translation.id;
        this.locale = translation.locale;
        this.contentValue = translation.content_value;
    }
}

export class PageContentResponseDTO {
    constructor(pageContent) {
        this.id = pageContent.id;
        this.sectionKey = pageContent.section_key;
        this.translations = pageContent.translations ? new PageContentTranslationResponseDTO(pageContent.translations) : null;
    }

    static fromModel(pageContent) {
        return new PageContentResponseDTO(pageContent);
    }
}
