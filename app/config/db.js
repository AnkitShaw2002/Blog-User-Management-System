require('dotenv').config();
const mongoose = require('mongoose');

const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = DbConnection;
