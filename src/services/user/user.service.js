import { UserRepository } from '@/repositories/user/user.repository.js';
import { ApiError } from '@/exceptions/ApiError.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import redis from '@/config/redisClient.js';
import { User } from '@/config/database.js';

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllUsers() {
        return await this.userRepository.findAll();
    }

    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user;
    }

    async createUser(user) {
        const existingUser = await this.userRepository.findByEmail(user.email);
        if (existingUser) {
            throw new ApiError(409, 'Email already exists');
        }

        if (user.password) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
        }

        const newUser = await this.userRepository.create(user);

        await redis.del("laravel_cache:UserService.all");

        return newUser;
    }

    async login(requestDTO) {
        const user = await this.userRepository.findByEmail(requestDTO.email);

        if (!user) {
            throw new ApiError(401, 'Invalid credentials');
        }

        // Get user with password for verification
        const userWithPassword = await User.findOne({
            where: { email: requestDTO.email },
        });

        if (!userWithPassword || !userWithPassword.password) {
            throw new ApiError(401, 'Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(requestDTO.password, userWithPassword.password);

        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }

        return this._generateToken(user);
    }

    async handleGoogleAuth(dto) {
        const { googleId, displayName, email, image } = dto;

        // Validate email
        if (!email) {
            throw new ApiError(400, 'Email is required from Google account');
        }

        // Split display name properly
        const [firstName, lastName] = this._splitFullName(displayName || 'User');

        let existingUser = await this.userRepository.findByGoogleId(googleId);
        if (existingUser) {
            // Update names if they're missing or empty (in case Google profile changed)
            if (!existingUser.firstName || !existingUser.lastName || 
                existingUser.firstName === 'User' || existingUser.lastName === '') {
                await this.userRepository.updateUserNames(existingUser.id, firstName, lastName);
                existingUser = await this.userRepository.findById(existingUser.id);
            }
            // Update image if provided and user doesn't have one
            if (image && !existingUser.image) {
                await this.userRepository.update(existingUser.id, { image });
                existingUser = await this.userRepository.findById(existingUser.id);
            }
            return this._generateToken(existingUser);
        }

        existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            // Update existing user with Google ID and names
            const updatedUser = await this.userRepository.updateUserWithGoogleInfo(
                existingUser.id, 
                googleId, 
                firstName, 
                lastName,
                image
            );
            return this._generateToken(updatedUser);
        }

        // Create new user
        const newUser = await this.userRepository.create({
            googleId,
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: null, // Google users don't have passwords
            gender: null, // Can be updated later
            image: image || null,
        });

        return this._generateToken(newUser);
    }

    async updateUser(id, userData) {
        await this.getUserById(id); // Check if exists

        if (userData.email) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser && existingUser.id !== id) {
                throw new ApiError(409, 'Email already exists');
            }
        }

        return await this.userRepository.update(id, userData);
    }

    async deleteUser(id) {
        await this.getUserById(id); // Check if exists
        await this.userRepository.delete(id);
    }

    _generateToken(user) {
        const payload = { 
            id: user.id, 
            email: user.email, 
            role: user.role || 'user' 
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        return token;
    }

    _splitFullName(name) {
        if (!name || typeof name !== 'string') {
            return ['User', ''];
        }
        
        const fullName = name.trim().split(/\s+/);
        
        if (fullName.length === 0) {
            return ['User', ''];
        } else if (fullName.length === 1) {
            return [fullName[0], ''];
        } else {
            // First name is first word, last name is everything else
            const firstName = fullName[0];
            const lastName = fullName.slice(1).join(' ');
            return [firstName, lastName];
        }
    }
}