const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage for profile images
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Storage for blog images
const blogStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/blogs';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);
    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const uploadProfileImage = multer({ 
    storage: profileStorage, 
    fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }
);

const uploadBlogImage = multer({ 
    storage: blogStorage, fileFilter: imageFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = { uploadProfileImage, uploadBlogImage };
