const express = require('express');
const Router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../middleware/multerConfig');

// POST /api/auth/register  (Public)
Router.post('/register', uploadProfileImage.single('profileImage'), authController.register);

// POST /api/auth/login  (Public)
Router.post('/login', authController.login);

// GET /api/auth/logout  (Protected)
Router.get('/logout', isAuthenticated, authController.logout);

module.exports = Router;
