import redisClient from '../config/redisClient.js';

export const cacheRemember = async (cacheKey, ttl, callback) => {
    try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }
    } catch (cacheError) {
        console.error(`Cache read error for ${cacheKey}:`, cacheError);
    }

    const data = await callback();

    try {
        await redisClient.setex(cacheKey, ttl, JSON.stringify(data));
    } catch (cacheError) {
        console.error(`Cache write error for ${cacheKey}:`, cacheError);
    }

    return data;
}