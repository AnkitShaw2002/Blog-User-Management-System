require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const DbConnection = require('./app/config/db');

const app = express();

//For database connect
DbConnection();

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Session
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(cookieParser());

// Flash messages
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes

const authRoute = require('./app/routes/authRoute');
const userRoute = require('./app/routes/userRoute');
const blogApiRoute = require('./app/routes/blogApiRoute');
const pageRoute = require('./app/routes/pageRoute');

app.use('/', pageRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/blogs', blogApiRoute);


// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

const port = process.env.PORT || 7000;
app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});
