import express from 'express';
import { 
    createBlog, 
    getBlogs, 
    getPostBySlug, 
    getBlogById,
    updateBlog,
    deleteBlog
} from '../controllers/blog.controller.js';
import { protectAdmin } from '../../middlewares/auth.middleware.js'; 

const router = express.Router();


router.post('/admin/create', protectAdmin, createBlog);
router.put('/admin/update/:id', protectAdmin, updateBlog);
router.delete('/admin/delete/:id', protectAdmin, deleteBlog);
router.get('/admin/:id', protectAdmin, getBlogById); 


router.get('/', getBlogs);
router.get('/:slug', getPostBySlug);

export default router;