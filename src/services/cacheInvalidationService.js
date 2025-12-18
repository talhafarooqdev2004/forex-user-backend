import Redis from 'ioredis';
import { logger } from '../utils/logger.util.js';
import sseService from './sseService.js';

class CacheInvalidationService {
    constructor() {
        // Subscriber Redis connection for listening to events
        this.subscriber = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: process.env.REDIS_DB || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        });

        // Main Redis connection for cache operations
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            db: process.env.REDIS_DB || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Subscribe to Laravel's broadcasting channel
        // Laravel may use a prefixed channel name like "{app-name}:cache-invalidation"
        // Subscribe to both the exact channel and use pattern matching as fallback
        this.subscriber.subscribe('cache-invalidation', (err, count) => {
            if (err) {
                logger.error('Failed to subscribe to cache invalidation channel', { error: err });
                return;
            }
            logger.info(`Subscribed to cache invalidation channel. Active subscriptions: ${count}`);
        });

        // Also subscribe with pattern matching to catch prefixed channels
        this.subscriber.psubscribe('*:cache-invalidation', (err, count) => {
            if (err) {
                logger.error('Failed to psubscribe to cache invalidation pattern', { error: err });
                return;
            }
            logger.info(`Subscribed to cache invalidation pattern. Active subscriptions: ${count}`);
        });

        // Handle incoming cache invalidation messages (direct subscription)
        this.subscriber.on('message', async (channel, message) => {
            try {
                logger.info('Received Redis message (direct)', { channel, message: message.substring(0, 200) });
                
                if (channel === 'cache-invalidation' || channel.endsWith(':cache-invalidation')) {
                    const parsedMessage = JSON.parse(message);
                    logger.info('Parsed cache invalidation message (direct)', { parsedMessage });
                    await this.handleCacheInvalidation(parsedMessage);
                }
            } catch (error) {
                logger.error('Error processing cache invalidation message (direct)', {
                    error: error.message,
                    channel,
                    message: message.substring(0, 200),
                    stack: error.stack,
                });
            }
        });

        // Handle incoming cache invalidation messages (pattern subscription)
        this.subscriber.on('pmessage', async (pattern, channel, message) => {
            try {
                logger.info('Received Redis message (pattern)', { pattern, channel, message: message.substring(0, 200) });
                
                if (pattern === '*:cache-invalidation' && channel.endsWith(':cache-invalidation')) {
                    const parsedMessage = JSON.parse(message);
                    logger.info('Parsed cache invalidation message (pattern)', { parsedMessage });
                    await this.handleCacheInvalidation(parsedMessage);
                }
            } catch (error) {
                logger.error('Error processing cache invalidation message (pattern)', {
                    error: error.message,
                    pattern,
                    channel,
                    message: message.substring(0, 200),
                    stack: error.stack,
                });
            }
        });

        // Handle Redis connection events
        this.subscriber.on('connect', () => {
            logger.info('Cache invalidation service connected to Redis');
        });

        this.subscriber.on('error', (error) => {
            logger.error('Redis subscriber error', { error });
        });

        this.redis.on('error', (error) => {
            logger.error('Redis cache error', { error });
        });
    }

    async handleCacheInvalidation(eventData) {
        try {
            logger.info('Received cache invalidation event', { eventData });

            // Laravel Redis broadcasting format:
            // { event: 'education.updated', data: {...} }
            // The 'event' field contains the broadcastAs() value
            // The 'data' field contains the broadcastWith() return value
            
            let data = eventData;
            let eventType = null;
            
            // Check if Laravel sent nested format with event and data
            if (eventData.event) {
                eventType = eventData.event;
                // Use data property - this contains the actual payload from broadcastWith()
                data = eventData.data || eventData;
            }
            
            // If no event type found yet, try to detect from data structure
            if (!eventType) {
                if (eventData.page_identifier) {
                    // Page content event format
                    eventType = 'page-content.updated';
                    data = eventData;
                } else if (eventData.education_id || eventData.slug) {
                    // Education event format - default to updated if not specified
                    eventType = 'education.updated';
                data = eventData;
            } else {
                    logger.warn('Unknown event format received - no event type detected', { eventData });
                    return;
                }
            }

            logger.info('Detected event type', { eventType, data });

            // Normalize event type (handle full class names like "App\\Events\\Education\\EducationUpdated")
            if (eventType.includes('Education')) {
                if (eventType.includes('Created')) {
                    eventType = 'education.created';
                } else if (eventType.includes('Updated')) {
                    eventType = 'education.updated';
                } else if (eventType.includes('Deleted')) {
                    eventType = 'education.deleted';
                } else if (eventType.includes('Published')) {
                    eventType = 'education.published';
                }
            }

            // Handle education events
            if (eventType && eventType.startsWith('education.')) {
                logger.info('Processing education cache invalidation', { eventType, data });
                await this.invalidateEducationCache(data);
                return;
            }

            // Handle page content events
            if (eventType === 'page-content.updated' || data.page_identifier) {
                logger.info('Processing page content cache invalidation', { eventType, data });
            await this.invalidatePageContentCache(data);
                return;
            }

            logger.warn('Unhandled event type', { eventType, eventData });
        } catch (error) {
            logger.error('Error handling cache invalidation', {
                error: error.message,
                stack: error.stack,
                eventData,
            });
        }
    }

    async invalidatePageContentCache(data) {
        const { cache_keys, page_identifier, locale, section_key } = data;

        if (!cache_keys || !Array.isArray(cache_keys)) {
            logger.warn('No cache keys provided for invalidation', { data });
            return;
        }

        const deletedKeys = [];
        const failedKeys = [];

        for (const cacheKey of cache_keys) {
            try {
                const result = await this.redis.del(cacheKey);
                if (result > 0) {
                    deletedKeys.push(cacheKey);
                } else {
                    logger.debug(`Cache key not found: ${cacheKey}`);
                }
            } catch (error) {
                failedKeys.push({ key: cacheKey, error: error.message });
                logger.error(`Failed to delete cache key: ${cacheKey}`, { error });
            }
        }

        logger.info('Page content cache invalidation completed', {
            page_identifier,
            locale,
            section_key,
            deleted_keys: deletedKeys,
            failed_keys: failedKeys,
            total_processed: cache_keys.length,
        });

        // Broadcast cache invalidation to frontend clients via SSE
        sseService.broadcastCacheInvalidation(page_identifier, locale, section_key);

        // Optionally, invalidate related pattern-based keys
        await this.invalidateRelatedKeys(page_identifier);
    }

    async invalidateRelatedKeys(pageIdentifier) {
        try {
            // Find and delete all keys matching the pattern
            const pattern = `page-content:${pageIdentifier}:*`;
            const keys = await this.redis.keys(pattern);
            
            if (keys.length > 0) {
                const result = await this.redis.del(...keys);
                logger.info(`Invalidated ${result} related cache keys for pattern: ${pattern}`);
            }
        } catch (error) {
            logger.error('Error invalidating related cache keys', {
                error: error.message,
                pageIdentifier,
            });
        }
    }

    // Manual cache invalidation method for direct use
    async invalidatePageContent(pageIdentifier, locale = null) {
        try {
            const keys = [];
            
            if (locale) {
                keys.push(`page-content:${pageIdentifier}:${locale}`);
            } else {
                // Invalidate all locales for this page
                const pattern = `page-content:${pageIdentifier}:*`;
                const matchingKeys = await this.redis.keys(pattern);
                keys.push(...matchingKeys);
            }

            if (keys.length > 0) {
                const result = await this.redis.del(...keys);
                logger.info(`Manually invalidated ${result} cache keys`, { keys });
                return result;
            }

            return 0;
        } catch (error) {
            logger.error('Error in manual cache invalidation', {
                error: error.message,
                pageIdentifier,
                locale,
            });
            throw error;
        }
    }

    async invalidateEducationCache(data) {
        const { cache_keys, education_id, slug, locales } = data;

        if (!cache_keys || !Array.isArray(cache_keys)) {
            logger.warn('No cache keys provided for education invalidation', { data });
            return;
        }

        const deletedKeys = [];
        const failedKeys = [];

        // Delete specific cache keys provided
        for (const cacheKey of cache_keys) {
            try {
                const result = await this.redis.del(cacheKey);
                if (result > 0) {
                    deletedKeys.push(cacheKey);
                } else {
                    logger.debug(`Education cache key not found: ${cacheKey}`);
                }
            } catch (error) {
                failedKeys.push({ key: cacheKey, error: error.message });
                logger.error(`Failed to delete education cache key: ${cacheKey}`, { error });
            }
        }

        // Also invalidate by education ID pattern (tag-based invalidation)
        if (education_id) {
            await this.invalidateEducationById(education_id, locales);
        }

        // Also invalidate pattern-based keys by slug
        if (slug) {
            await this.invalidateEducationPatternKeys(slug, locales);
        }

        logger.info('Education cache invalidation completed', {
            education_id,
            slug,
            locales,
            deleted_keys: deletedKeys,
            failed_keys: failedKeys,
            total_processed: cache_keys.length,
        });
    }

    async invalidateEducationById(educationId, locales = []) {
        try {
            // Invalidate all cache keys related to this education ID using tag-based patterns
            // Since cache keys use slug, we need to invalidate by pattern matching
            // The cache_keys array from broadcast already contains the specific keys to invalidate
            // This method provides additional pattern-based invalidation as a safety net
            
            const allKeys = await this.redis.keys('education:*');
            let invalidatedCount = 0;
            
            // If we have locales, invalidate list cache for those locales
            if (locales && locales.length > 0) {
                for (const locale of locales) {
                    const listKey = `education:all:${locale}`;
                    const result = await this.redis.del(listKey);
                    if (result > 0) {
                        invalidatedCount++;
                        logger.debug(`Invalidated list cache for locale: ${locale}`);
                    }
                }
            } else {
                // If no locales specified, invalidate all list caches
                const listKeys = allKeys.filter(key => key.startsWith('education:all:'));
                if (listKeys.length > 0) {
                    const result = await this.redis.del(...listKeys);
                    invalidatedCount += result;
                    logger.debug(`Invalidated ${result} list cache keys`);
                }
            }
            
            if (invalidatedCount > 0) {
                logger.info(`Invalidated ${invalidatedCount} education cache keys by ID ${educationId}`);
            }
        } catch (error) {
            logger.error('Error invalidating education cache by ID', {
                error: error.message,
                educationId,
            });
        }
    }

    async invalidateEducationPatternKeys(slug, locales) {
        try {
            const patterns = [
                `education:all:*`,
                `education:${slug}:*`,
            ];
            
            for (const pattern of patterns) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    const result = await this.redis.del(...keys);
                    logger.info(`Invalidated ${result} education cache keys for pattern: ${pattern}`);
                }
            }
        } catch (error) {
            logger.error('Error invalidating education pattern cache keys', {
                error: error.message,
                slug,
                locales,
            });
        }
    }

    // Health check method
    async healthCheck() {
        try {
            await this.redis.ping();
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Graceful shutdown
    async shutdown() {
        try {
            await this.subscriber.quit();
            await this.redis.quit();
            logger.info('Cache invalidation service shut down gracefully');
        } catch (error) {
            logger.error('Error during cache invalidation service shutdown', { error });
        }
    }
}

// Create singleton instance
const cacheInvalidationService = new CacheInvalidationService();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    await cacheInvalidationService.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await cacheInvalidationService.shutdown();
    process.exit(0);
});

export default cacheInvalidationService;
