import express from 'express';
import cacheInvalidationService from '../services/cacheInvalidationService.js';

const router = express.Router();

// Health check for cache invalidation service
router.get('/cache-invalidation', async (req, res) => {
    try {
        const health = await cacheInvalidationService.healthCheck();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json({
            service: 'cache-invalidation',
            ...health
        });
    } catch (error) {
        res.status(503).json({
            service: 'cache-invalidation',
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Manual cache invalidation endpoint (for debugging)
router.delete('/cache/:pageIdentifier/:locale?', async (req, res) => {
    try {
        const { pageIdentifier, locale } = req.params;
        const result = await cacheInvalidationService.invalidatePageContent(pageIdentifier, locale);
        
        res.json({
            success: true,
            message: `Invalidated ${result} cache keys`,
            page_identifier: pageIdentifier,
            locale: locale || 'all',
            keys_deleted: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
