import {
    Router
} from 'express';
import PageContentController from '../controllers/v1/pageContent.controller.js';

const router = Router();

router.get('/:pageIdentifier', PageContentController.getByPageIdentifier);

export default router;

