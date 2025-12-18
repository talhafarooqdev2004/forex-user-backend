import express from 'express';
import PackageController from '../controllers/v1/package.controller.js';

const router = express.Router();
const packageController = new PackageController();

router.get(
    '/',
    packageController.index,
)

router.get(
    '/:id',
    packageController.show,
)

export default router;