import PostRepository from "../repositories/forum/post.repository.js";
import TopicRepository from "../repositories/forum/topic.repository.js"

export default class ForumService {
    constructor() {
        this.topicRepository = new TopicRepository();
        this.postRepository = new PostRepository();
    }

    getTopicsWithPostIDs = async (locale) => {
        return await this.topicRepository.all(locale);
    }

    getPosts = async (locale, ids) => {
        return await this.postRepository.all(locale, ids);
    }

    getPostsByTopicId = async (locale, topicId) => {
        return await this.postRepository.findPostsByTopicId(locale, topicId);
    }

    getPostBySlug = async (locale, slug) => {
        return await this.postRepository.findPostBySlug(locale, slug);
    }
}