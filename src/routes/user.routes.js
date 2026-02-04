import express from 'express';
import { UserController } from '../controllers/v1/user/user.controller.js';
import { authMiddleware, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema, UserLoginSchema } from '../validators/user/user.validator.js';
import passport from '@/config/passport-setup.js';

const router = express.Router();
const userController = new UserController();

// Public routes
router.post(
    '/auth/register',
    validate(createUserSchema),
    userController.createUser
);

router.post(
    '/auth/login',
    validate(UserLoginSchema),
    userController.login,
)

router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login-failed'
    }),
    userController.handleGoogleAuth
);

// Protected routes (require authentication)
router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, validate(updateUserSchema), userController.updateCurrentUser);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Admin only routes
router.put(
    '/:id',
    authorize('admin'),
    validate(updateUserSchema),
    userController.updateUser
);

router.delete(
    '/:id',
    authorize('admin'),
    userController.deleteUser
);

export default router;