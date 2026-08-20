import express from 'express';
import { protectAdmin } from '../../../middlewares/auth.middleware.js';
import { 
    createBlog, 
    updateBlog,
    deleteBlog
} from '../controllers/blog.controller.js';
import {  
    getBlogs, 
    getPostBySlug,
    getPublicBlogs, 
    getPostById, 
} from '../controllers/blog.query.controller.js';

const router = express.Router();


router.get('/', getBlogs);
router.get('/public', getPublicBlogs);  
router.get('/slug/:slug', getPostBySlug);   

router.post('/', protectAdmin, createBlog);
router.put('/:id', protectAdmin, updateBlog);
router.delete('/:id', protectAdmin, deleteBlog);
router.get('/admin/:id', protectAdmin, getPostById); 

export default router;