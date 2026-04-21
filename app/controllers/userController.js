const UserModel = require('../models/userModel');
const fs = require('fs');

class UserController {

   
    async getAllUsers(req, res) {
        try {
            const users = await UserModel.find().select('-password').sort({ createdAt: -1 });
            return res.status(200).json({
                status: true,
                message: 'Users fetched successfully',
                data: users,
            });
        } catch (error) {
            console.log('Get users error:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

   
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Prevent admin from deleting themselves
            if (id === req.user.id) {
                req.flash('error_msg', 'You cannot delete your own account.');
                return res.redirect('/users');
            }

            const user = await UserModel.findById(id);
            if (!user) {
                req.flash('error_msg', 'User not found.');
                return res.redirect('/users');
            }

            // Delete profile image if exists
            if (user.profileImage && fs.existsSync(user.profileImage)) {
                fs.unlinkSync(user.profileImage);
            }

            await UserModel.findByIdAndDelete(id);

            req.flash('success_msg', `User "${user.name}" deleted successfully.`);
            return res.redirect('/users');

        } catch (error) {
            console.log('Delete user error:', error);
            req.flash('error_msg', 'Failed to delete user.');
            return res.redirect('/users');
        }
    }
}

module.exports = new UserController();
