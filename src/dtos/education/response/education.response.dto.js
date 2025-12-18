export class EducationIndexResponseDTO {
    constructor(educationModel) {
        this.id = parseInt(educationModel.id);
        this.slug = educationModel.slug;

        this.translation = {
            title: educationModel.translation?.title ?? '',
            content: educationModel.translation?.content ?? '',
        };
    }

    static fromModel(educationModel) {
        if (!educationModel) {
            throw new Error('Education model is required');
        }
        return new this(educationModel);
    }
}