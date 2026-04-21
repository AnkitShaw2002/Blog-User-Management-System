const BlogModel = require('../models/blogModel');
const UserModel = require('../models/userModel');

class PageController {

 
    async registerView(req, res) {
        if (req.user) return res.redirect('/dashboard');
        res.render('register', { title: 'Register' });
    }

  
    async loginView(req, res) {
        if (req.user) return res.redirect('/dashboard');
        res.render('login', { title: 'Login' });
    }

    async dashboard(req, res) {
    try {
        let blogs;
        if (req.user.role === 'admin') {
            blogs = await BlogModel.aggregate([
                { $match: { isDeleted: false } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                { $unwind: '$author' },
                { $sort: { createdAt: -1 } },
                { $limit: 10 }
            ]);
        } else {
            // Standard find is fine here as no join is required for "own blogs"
            blogs = await BlogModel.find({ author: req.user.id }).sort({ createdAt: -1 });
        }

        const totalBlogs = await BlogModel.countDocuments({ isDeleted: false });
        const totalUsers = await UserModel.countDocuments();

        res.render('dashboard', {
            title: 'Dashboard',
            data: req.user,
            blogs,
            totalBlogs,
            totalUsers,
        });
    } catch (error) {
        req.flash('error_msg', 'Failed to load dashboard.');
        res.redirect('/login');
    }
}

  
    async blogsListView(req, res) {
    try {
        const blogs = await BlogModel.aggregate([
            { $match: { isDeleted: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            { $sort: { createdAt: -1 } }
        ]);

        res.render('blogs/list', {
            title: 'All Blogs',
            blogs,
            data: req.user || null,
        });
    } catch (error) {
        res.redirect('/');
    }
}

  
    async blogCreateView(req, res) {
        res.render('blogs/create', {
            title: 'Create Blog',
            data: req.user,
        });
    }

  
    async blogEditView(req, res) {
        try {
            const blog = await BlogModel.findById(req.params.id);
            if (!blog || blog.isDeleted) {
                req.flash('error_msg', 'Blog not found.');
                return res.redirect('/blogs');
            }

            // Only owner or admin can edit
            if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
                req.flash('error_msg', 'Unauthorized.');
                return res.redirect('/blogs');
            }

            res.render('blogs/edit', {
                title: 'Edit Blog',
                data: req.user,
                blog,
            });
        } catch (error) {
            console.log('Blog edit view error:', error);
            req.flash('error_msg', 'Failed to load blog.');
            res.redirect('/blogs');
        }
    }

    
   async blogDetailView(req, res) {
    try {
        const blog = await BlogModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id), isDeleted: false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' }
        ]);

        if (!blog.length) {
            req.flash('error_msg', 'Blog not found.');
            return res.redirect('/blogs');
        }

        res.render('blogs/detail', {
            title: blog[0].title,
            blog: blog[0],
            data: req.user || null,
        });
    } catch (error) {
        res.redirect('/blogs');
    }
}

   
    async usersView(req, res) {
        try {
            const users = await UserModel.find().select('-password').sort({ createdAt: -1 });

            res.render('users/index', {
                title: 'User Management',
                data: req.user,
                users,
            });
        } catch (error) {
            console.log('Users view error:', error);
            req.flash('error_msg', 'Failed to load users.');
            res.redirect('/dashboard');
        }
    }
}

module.exports = new PageController();
