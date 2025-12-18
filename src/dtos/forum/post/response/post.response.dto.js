export class PostResponseDTO {
    constructor(postModel) {
        this.id = parseInt(postModel.id);
        this.bannerImg = postModel.banner_img;
        this.slug = postModel.slug;
        this.topic = postModel?.topic?.translation.title;

        this.translation = {
            title: postModel.translation.title,
            content: postModel.translation.content,
        };

        this.createdAt = postModel.created_at;
    }

    static fromModel(postModel) {
        return new this(postModel);
    }
}