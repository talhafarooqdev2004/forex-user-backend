import express from 'express';
import EducationController from '../controllers/v1/education.controller.js';

const router = express.Router();
const educationController = new EducationController();

router.get(
    '/',
    educationController.index
);

router.get(
    '/get',
    educationController.show
);

export default router;