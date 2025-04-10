import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.post("/",auth(USER_ROLES.SUPER_ADMIN), CategoryController.createCategory)
router.get('/', CategoryController.getAllCategories); 
router.get('/:id', CategoryController.getSingleCategory);
router.patch('/:id',auth(USER_ROLES.SUPER_ADMIN), CategoryController.updateCategory);
router.delete('/:id',auth(USER_ROLES.SUPER_ADMIN), CategoryController.deleteCategory); 

export const CategoryRoutes = router;
