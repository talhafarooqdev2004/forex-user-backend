import { logger } from '../utils/logger.util.js';

class SSEService {
    constructor() {
        this.clients = new Set();
        this.setupCleanup();
    }

    /**
     * Add a new SSE client
     */
    addClient(res, clientId = null) {
        const client = {
            id: clientId || Date.now().toString(),
            res,
            lastPing: Date.now(),
        };

        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        });

        // Send initial connection event
        this.sendToClient(client, 'connected', {
            clientId: client.id,
            timestamp: new Date().toISOString(),
        });

        this.clients.add(client);

        // Handle client disconnect
        res.on('close', () => {
            this.clients.delete(client);
            logger.info(`SSE client disconnected: ${client.id}`);
        });

        // Send periodic ping to keep connection alive
        const pingInterval = setInterval(() => {
            if (this.clients.has(client)) {
                this.sendToClient(client, 'ping', { timestamp: new Date().toISOString() });
                client.lastPing = Date.now();
            } else {
                clearInterval(pingInterval);
            }
        }, 30000); // Ping every 30 seconds

        logger.info(`SSE client connected: ${client.id}`);
        return client;
    }

    /**
     * Send event to specific client
     */
    sendToClient(client, event, data) {
        try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            client.res.write(message);
        } catch (error) {
            logger.error('Error sending SSE message to client', {
                clientId: client.id,
                error: error.message,
            });
            this.clients.delete(client);
        }
    }

    /**
     * Broadcast event to all connected clients
     */
    broadcast(event, data) {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        
        logger.info(`Broadcasting SSE event: ${event}`, {
            event,
            data,
            clientCount: this.clients.size,
        });

        // Send to all clients
        for (const client of this.clients) {
            try {
                client.res.write(message);
            } catch (error) {
                logger.error('Error broadcasting SSE message', {
                    clientId: client.id,
                    error: error.message,
                });
                this.clients.delete(client);
            }
        }
    }

    /**
     * Broadcast cache invalidation event
     */
    broadcastCacheInvalidation(pageIdentifier, locale, sectionKey) {
        this.broadcast('cache-invalidated', {
            pageIdentifier,
            locale,
            sectionKey,
            timestamp: new Date().toISOString(),
            // Tell frontend which SWR keys to invalidate
            swrKeys: [
                'aboutUs',
                `aboutUs-${pageIdentifier}`,
                `aboutUs-${pageIdentifier}-${locale}`,
            ],
        });
    }

    /**
     * Get connection stats
     */
    getStats() {
        return {
            connectedClients: this.clients.size,
            clients: Array.from(this.clients).map(client => ({
                id: client.id,
                lastPing: client.lastPing,
                connected: Date.now() - client.lastPing < 60000,
            })),
        };
    }

    /**
     * Clean up dead connections
     */
    setupCleanup() {
        setInterval(() => {
            const now = Date.now();
            const deadClients = [];

            for (const client of this.clients) {
                // Remove clients that haven't pinged in 2 minutes
                if (now - client.lastPing > 120000) {
                    deadClients.push(client);
                }
            }

            deadClients.forEach(client => {
                this.clients.delete(client);
                try {
                    client.res.end();
                } catch (error) {
                    // Client already disconnected
                }
            });

            if (deadClients.length > 0) {
                logger.info(`Cleaned up ${deadClients.length} dead SSE connections`);
            }
        }, 60000); // Check every minute
    }
}

// Create singleton instance
const sseService = new SSEService();

export default sseService;
