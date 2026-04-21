const UserModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class AuthController {

  
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error_msg', 'All fields are required.');
                return res.redirect('/register');
            }

            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error_msg', 'Email already registered. Please login.');
                return res.redirect('/register');
            }

            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);

            const profileImage = req.file ? req.file.path : null;

            // Only allow admin role if explicitly set (first admin setup)
            const userRole = (role === 'admin') ? 'admin' : 'user';

            const newUser = new UserModel({
                name,
                email,
                password: hashedPassword,
                role: userRole,
                profileImage,
            });

            await newUser.save();

            req.flash('success_msg', 'Registration successful! Please login.');
            return res.redirect('/login');

        } catch (error) {
            console.log('Register error:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error_msg', 'Registration failed. Please try again.');
            return res.redirect('/register');
        }
    }

  
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                req.flash('error_msg', 'Email and password are required.');
                return res.redirect('/login');
            }

            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('error_msg', 'Invalid email or password.');
                return res.redirect('/login');
            }

            if (!user.isActive) {
                req.flash('error_msg', 'Your account has been deactivated. Contact admin.');
                return res.redirect('/login');
            }

            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                req.flash('error_msg', 'Invalid email or password.');
                return res.redirect('/login');
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            req.flash('success_msg', `Welcome back, ${user.name}!`);
            return res.redirect('/dashboard');

        } catch (error) {
            console.log('Login error:', error);
            req.flash('error_msg', 'Login failed. Please try again.');
            return res.redirect('/login');
        }
    }

  
    async logout(req, res) {
        res.clearCookie('token');
        req.flash('success_msg', 'You have been logged out successfully.');
        return res.redirect('/login');
    }
}

module.exports = new AuthController();
