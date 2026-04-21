const express = require('express');
const Router = express.Router();
const blogController = require('../controllers/blogController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { uploadBlogImage } = require('../middleware/multerConfig');

// POST /api/blogs  (Protected)
Router.post('/', isAuthenticated, uploadBlogImage.single('blogImage'), blogController.createBlog);

// GET /api/blogs  (Public)
Router.get('/', blogController.getAllBlogs);

// GET /api/blogs/:id  (Public)
Router.get('/:id', blogController.getBlogById);

// PUT /api/blogs/:id  (Protected)
Router.post('/update/:id', isAuthenticated, uploadBlogImage.single('blogImage'), blogController.updateBlog);

// DELETE /api/blogs/:id  (Protected)
Router.post('/delete/:id', isAuthenticated, blogController.deleteBlog);

module.exports = Router;
