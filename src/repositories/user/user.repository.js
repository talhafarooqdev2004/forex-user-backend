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
            phone: userData.phone ?? null,
            googleId: userData.googleId ?? null,
            image: userData.image ?? null,
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
        const updateData = {};
        
        if (userData.firstName !== undefined) {
            updateData.firstName = userData.firstName;
        }
        if (userData.lastName !== undefined) {
            updateData.lastName = userData.lastName;
        }
        if (userData.email !== undefined) {
            updateData.email = userData.email;
        }
        if (userData.gender !== undefined) {
            updateData.gender = userData.gender || null;
        }
        if (userData.phone !== undefined) {
            updateData.phone = userData.phone || null;
        }
        if (userData.image !== undefined) {
            updateData.image = userData.image || null;
        }

        await User.update(updateData, {
            where: { id: id }
        });

        const updatedUser = await User.findByPk(id, {
            attributes: {
                exclude: ['password'],
            },
        });
        return updatedUser ? updatedUser.toJSON() : null;
    }

    async delete(id) {
        await sequelize.query('DELETE FROM users WHERE id = $1', { bind: [id] });
    }
}