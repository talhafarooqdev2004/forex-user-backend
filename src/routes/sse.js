import express from 'express';
import sseService from '../services/sseService.js';

const router = express.Router();

// SSE endpoint for real-time cache invalidation
router.get('/cache-events', (req, res) => {
    const clientId = req.query.clientId || null;
    
    // Add client to SSE service
    const client = sseService.addClient(res, clientId);
    
    // Keep connection alive
    req.on('close', () => {
        // Client disconnected, cleanup handled by SSE service
    });
});

// SSE stats endpoint (for debugging)
router.get('/stats', (req, res) => {
    const stats = sseService.getStats();
    res.json({
        success: true,
        ...stats,
        timestamp: new Date().toISOString(),
    });
});

// Manual broadcast endpoint (for testing)
router.post('/broadcast', (req, res) => {
    const { event, data } = req.body;
    
    if (!event || !data) {
        return res.status(400).json({
            success: false,
            error: 'Event and data are required',
        });
    }
    
    sseService.broadcast(event, data);
    
    res.json({
        success: true,
        message: `Broadcasted ${event} to ${sseService.getStats().connectedClients} clients`,
    });
});

export default router;
