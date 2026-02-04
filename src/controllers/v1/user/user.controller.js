import dotenv from "dotenv";
dotenv.config();

import { UserService } from '@/services/user/user.service.js';
import { CreateUserRequestDTO, UserLoginRequestDTO, UserGoogleAuthLoginRequestDTO } from '@/dtos/user/request/user.request.dto.js';
import { UserResponseDTO, UserLoginResponseDTO } from '@/dtos/user/response/user.response.dto.js';
import { successResponse } from '@/utils/response.util.js';
import { ApiError } from '@/exceptions/ApiError.js';
import axios from "axios";

const { LARAVEL_API_URL, LARAVEL_CACHE_API_KEY } = process.env;

export class UserController {
    constructor() {
        this.userService = new UserService();
    }

    getAllUsers = async (req, res, next) => {
        return res.json(successResponse('Users fetched successfully'));
        try {
            const users = await this.userService.getAllUsers();
            const responseData = UserResponseDTO.fromArray(users);

            return res.json(successResponse('Users fetched successfully', responseData));
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req, res, next) => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            const responseData = new UserResponseDTO(user);

            return res.json(successResponse('User fetched successfully', responseData));
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req, res, next) => {
        try {
            const dto = new CreateUserRequestDTO(req.body);
            const user = await this.userService.createUser(dto.toServiceFormat());
            const responseData = new UserResponseDTO(user);

            // Flush cache asynchronously (fire-and-forget)
            this.__flushCache().catch(err => {
                console.warn('Cache flush failed (non-blocking):', err.message);
            });

            return res.status(201).json(
                successResponse('User created successfully', responseData)
            );
        } catch (error) {
            next(error);
        }
    };

    login = async (req, res, next) => {
        try {
            const dto = new UserLoginRequestDTO(req.body);
            const token = await this.userService.login(dto.toServiceFormat());
            const responseData = new UserLoginResponseDTO(token);

            return res.status(200).json(
                successResponse('User Login successfully', responseData)
            );
        } catch (error) {
            next(error);
        }
    }

    getCurrentUser = async (req, res, next) => {
        try {
            const user = await this.userService.getUserById(req.user.id);
            const responseData = new UserResponseDTO(user);

            return res.status(200).json(
                successResponse('User fetched successfully', responseData)
            );
        } catch (error) {
            next(error);
        }
    }

    updateCurrentUser = async (req, res, next) => {
        try {
            // Update current user's own profile (self-update)
            const userId = req.user.id;
            const user = await this.userService.updateUser(userId, req.body);
            const responseData = new UserResponseDTO(user);

            return res.json(successResponse('Profile updated successfully', responseData));
        } catch (error) {
            next(error);
        }
    };

    handleGoogleAuth = async (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Social authentication failed'));
        }

        try {
            console.log('Google Auth Profile:', JSON.stringify(req.user, null, 2));
            
            const dto = new UserGoogleAuthLoginRequestDTO(req.user);

            // Validate DTO
            if (!dto.googleId || !dto.email) {
                return next(new ApiError(400, 'Missing required Google account information'));
            }

            const token = await this.userService.handleGoogleAuth(dto.toServiceFormat());

            // Flush cache asynchronously (fire-and-forget) - don't wait for it
            this.__flushCache().catch(err => {
                console.warn('Cache flush failed (non-blocking):', err.message);
            });

            // Use environment variable for admin dashboard URL (forex-admin where callback is)
            // Default to localhost:3000 for forex-admin (shared dashboard)
            const adminDashboardUrl = process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
            const frontendCallbackUrl = `${adminDashboardUrl}/auth/google/callback?token=${token}`;
            
            console.log('Redirecting to:', frontendCallbackUrl);
            return res.redirect(frontendCallbackUrl);

        } catch (error) {
            console.error('Google Auth Error:', error);
            next(error);
        }
    };

    updateUser = async (req, res, next) => {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            const responseData = new UserResponseDTO(user);

            return res.json(successResponse('User updated successfully', responseData));
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req, res, next) => {
        try {
            await this.userService.deleteUser(req.params.id);
            return res.json(successResponse('User deleted successfully'));
        } catch (error) {
            next(error);
        }
    };

    async __flushCache() {
        // Only flush if Laravel API URL is configured
        if (!LARAVEL_API_URL || !LARAVEL_CACHE_API_KEY) {
            return; // Silently skip if not configured
        }

        try {
            // Set a timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Cache flush timeout')), 2000);
            });

            await Promise.race([
                axios.post(`${LARAVEL_API_URL}/cache/flush/users`, {}, {
                    headers: {
                        "X-Cache-Key": LARAVEL_CACHE_API_KEY,
                    },
                    timeout: 2000,
                }),
                timeoutPromise
            ]);
        } catch (error) {
            // Log but don't throw - cache flush failure shouldn't break the flow
            console.warn('Cache flush failed (non-blocking):', error.message);
        }
    }
}