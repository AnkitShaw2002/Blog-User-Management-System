const BlogModel = require('../models/blogModel');
const fs = require('fs');
   const mongoose = require('mongoose');


class BlogController {

    
    async createBlog(req, res) {
        try {
            const { title, content, category } = req.body;

            if (!title || !content) {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error_msg', 'Title and content are required.');
                return res.redirect('/blogs/create');
            }

            const blogImage = req.file ? req.file.path : null;

            const blog = new BlogModel({
                title,
                content,
                category: category || 'Other',
                blogImage,
                author: req.user.id,
                authorName: req.user.name,
            });

            await blog.save();

            req.flash('success_msg', 'Blog created successfully!');
            return res.redirect('/blogs');

        } catch (error) {
            console.log('Create blog error:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error_msg', 'Failed to create blog.');
            return res.redirect('/blogs/create');
        }
    }

    
    async getAllBlogs(req, res) {
    try {
        const blogs = await BlogModel.aggregate([
            { $match: { isDeleted: false } },
            {
                $lookup: {
                    from: 'users', // The collection name in MongoDB (usually plural)
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    'author.password': 0, // Exclude sensitive data
                    'author.role': 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({
            status: true,
            message: 'Blogs fetched successfully',
            count: blogs.length,
            data: blogs,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

  


async getBlogById(req, res) {
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
            { $unwind: '$author' },
            { $limit: 1 }
        ]);

        if (!blog.length) {
            return res.status(404).json({ status: false, message: 'Blog not found.' });
        }

        return res.status(200).json({ status: true, data: blog[0] });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

   
    async updateBlog(req, res) {
        try {
            const { title, content, category } = req.body;
            const { id } = req.params;

            const blog = await BlogModel.findById(id);
            if (!blog || blog.isDeleted) {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error_msg', 'Blog not found.');
                return res.redirect('/blogs');
            }

            // Only owner or admin can update
            if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
                if (req.file) fs.unlinkSync(req.file.path);
                req.flash('error_msg', 'Unauthorized. You can only edit your own blogs.');
                return res.redirect('/blogs');
            }

            // Replace old image if new one uploaded
            if (req.file) {
                if (blog.blogImage && fs.existsSync(blog.blogImage)) {
                    fs.unlinkSync(blog.blogImage);
                }
                blog.blogImage = req.file.path;
            }

            blog.title = title || blog.title;
            blog.content = content || blog.content;
            blog.category = category || blog.category;

            await blog.save();

            req.flash('success_msg', 'Blog updated successfully!');
            return res.redirect('/blogs');

        } catch (error) {
            console.log('Update blog error:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            req.flash('error_msg', 'Failed to update blog.');
            return res.redirect('/blogs');
        }
    }

   
    async deleteBlog(req, res) {
        try {
            const { id } = req.params;

            const blog = await BlogModel.findById(id);
            if (!blog) {
                req.flash('error_msg', 'Blog not found.');
                return res.redirect('/blogs');
            }

           
            if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
                req.flash('error_msg', 'Unauthorized. You can only delete your own blogs.');
                return res.redirect('/blogs');
            }

            if (req.user.role === 'admin') {
               
                if (blog.blogImage && fs.existsSync(blog.blogImage)) {
                    fs.unlinkSync(blog.blogImage);
                }
                await BlogModel.findByIdAndDelete(id);
                req.flash('success_msg', 'Blog permanently deleted.');
            } else {
                // Soft delete
                blog.isDeleted = true;
                await blog.save();
                req.flash('success_msg', 'Blog deleted successfully.');
            }

            return res.redirect('/blogs');

        } catch (error) {
            console.log('Delete blog error:', error);
            req.flash('error_msg', 'Failed to delete blog.');
            return res.redirect('/blogs');
        }
    }
}

module.exports = new BlogController();
