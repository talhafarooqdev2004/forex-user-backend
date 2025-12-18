import 'module-alias/register.js';
import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { logger } from './src/utils/logger.util.js';

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${ENV.NODE_ENV} mode`);
});