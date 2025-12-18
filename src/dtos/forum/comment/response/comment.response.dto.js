export class CommentResponseDTO {
    constructor(commentModel) {
        this.id = parseInt(commentModel.id);
        this.postId = parseInt(commentModel.post_id);
        this.content = commentModel.content;
        this.createdAt = commentModel.created_at;
        this.updatedAt = commentModel.updated_at;

        if (commentModel.user) {
            const userData = commentModel.user.toJSON ? commentModel.user.toJSON() : commentModel.user;
            this.user = {
                id: parseInt(userData.id),
                firstName: userData.firstName || userData.first_name,
                lastName: userData.lastName || userData.last_name,
                email: userData.email
            };
        }
    }

    static fromModel(commentModel) {
        return new this(commentModel);
    }
}

