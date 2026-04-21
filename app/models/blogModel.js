const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlogSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['Tech', 'Lifestyle', 'Education', 'Travel', 'Food', 'Other'],
            default: 'Other',
        },
        blogImage: {
            type: String,
            default: null,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        authorName: {
            type: String,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false, // Soft delete for users
        },
    },
    {
        timestamps: true,
    }
);

const BlogModel = mongoose.model('Blog', BlogSchema);

module.exports = BlogModel;
