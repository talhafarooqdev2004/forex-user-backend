export class TopicIndexResponseDTO {
    constructor(topicModel) {
        this.id = parseInt(topicModel.id);

        this.translation = {
            title: topicModel.translation.title,
        };

        // this.postIds = topicModel.posts.map(p => parseInt(p.id));
    }

    static fromModel(topicModel) {
        return new this(topicModel);
    }
}