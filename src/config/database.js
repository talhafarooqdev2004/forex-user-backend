import { Sequelize } from 'sequelize';
import { ENV } from './env.js';
import { logger } from '../utils/logger.util.js';

import { User as UserModelDefinition } from '@/models/User.js';

export const sequelize = new Sequelize(
    ENV.DB_NAME,
    ENV.DB_USER,
    ENV.DB_PASSWORD,
    {
        host: ENV.DB_HOST,
        port: ENV.DB_PORT,
        dialect: 'postgres',
        logging: ENV.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const User = UserModelDefinition(sequelize);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('✅ PostgreSQL connected successfully');

        await sequelize.sync();
        logger.info('✅ Database tables synchronized (users table created/updated).');

    } catch (error) {
        logger.error('❌ Database connection or sync failed:', error);
        process.exit(1);
    }
};

connectDB();