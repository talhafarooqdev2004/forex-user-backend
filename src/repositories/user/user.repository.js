import { sequelize } from '@/config/database.js';
import { User } from '@/config/database.js';

export class UserRepository {
    async findAll() {
        const users = await User.findAll({
            attributes: {
                exclude: ['password'],
            },
            order: [['created_at', 'DESC']],
        });
        return users.map(user => user.toJSON());
    }

    async findById(id) {
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ['password'],
            },
        });
        return user ? user.toJSON() : null;
    }

    async findByEmail(email) {
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        return user ? user.toJSON() : null;
    }

    async findByEmailWithPassword(email) {
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        return user ? user.toJSON() : null;
    }

    async findByGoogleId(googleId) {
        const user = await User.findOne({
            where: {
                googleId: googleId,
            },
        });

        return user ? user.toJSON() : null;
    }

    async create(userData) {
        const newUser = await User.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            gender: userData.gender,
            googleId: userData.googleId ?? null,
        });

        return newUser.toJSON();
    }

    async insertGoogleId(userId, googleId) {
        await User.update(
            { googleId: googleId },
            { where: { id: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            attributes: {
                exclude: ['password'],
            },
        });
        return updatedUser ? updatedUser.toJSON() : null;
    }

    async updateUserNames(userId, firstName, lastName) {
        await User.update(
            { firstName, lastName },
            { where: { id: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            attributes: {
                exclude: ['password'],
            },
        });
        return updatedUser ? updatedUser.toJSON() : null;
    }

    async updateUserWithGoogleInfo(userId, googleId, firstName, lastName) {
        await User.update(
            { googleId, firstName, lastName },
            { where: { id: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            attributes: {
                exclude: ['password'],
            },
        });
        return updatedUser ? updatedUser.toJSON() : null;
    }

    async update(id, userData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (userData.name) {
            fields.push(`name = $${paramIndex++}`);
            values.push(userData.name);
        }
        if (userData.email) {
            fields.push(`email = $${paramIndex++}`);
            values.push(userData.email);
        }

        values.push(id);

        const [result] = await sequelize.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} 
       RETURNING id, name, email, created_at`,
            { bind: values }
        );
        return result[0];
    }

    async delete(id) {
        await sequelize.query('DELETE FROM users WHERE id = $1', { bind: [id] });
    }
}