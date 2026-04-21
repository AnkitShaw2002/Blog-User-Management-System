const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
// const CheckAuth = require('../middleware/CheckAuth');

// GET /api/users  (Admin only)
Router.get('/', isAuthenticated, isAdmin, userController.getAllUsers);

// DELETE /api/users/:id  (Admin only)
Router.post('/delete/:id', isAuthenticated, isAdmin, userController.deleteUser);

module.exports = Router;
