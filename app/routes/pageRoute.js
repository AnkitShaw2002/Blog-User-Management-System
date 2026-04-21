const express = require('express');
const Router = express.Router();
const pageController = require('../controllers/pageController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const CheckAuth = require('../middleware/CheckAuth');

// Public routes
Router.get('/', CheckAuth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.redirect('/blogs');
});

Router.get('/register', CheckAuth, pageController.registerView);
Router.get('/login', CheckAuth, pageController.loginView);

// Blog EJS pages
Router.get('/blogs', CheckAuth, pageController.blogsListView);
Router.get('/blogs/create', isAuthenticated, pageController.blogCreateView);
Router.get('/blogs/edit/:id', isAuthenticated, pageController.blogEditView);
Router.get('/blogs/:id', CheckAuth, pageController.blogDetailView);

// Protected
Router.get('/dashboard', isAuthenticated, pageController.dashboard);

// Admin only
Router.get('/users', isAuthenticated, isAdmin, pageController.usersView);

module.exports = Router;
