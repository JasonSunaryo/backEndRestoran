const jwt = require('jsonwebtoken');
const express = require('express');
const User = require('../models/user');
const app = express();
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const bodyParser = require('body-parser');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'secret', (err, decodedToken) => {
            if (err) {
                res.redirect('/login');
            } else {
                next();
            }
        });
    } else {
        // Jika cookie JWT tidak ada, arahkan pengguna ke halaman login
        res.redirect('/login');
    }
};

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, "secret", async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                try {
                    // Periksa dan dapatkan informasi pengguna dari database berdasarkan ID yang disandikan dalam token
                    let user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    next();
                } catch (error) {
                    console.error(error);
                    res.locals.user = null;
                    next();
                }
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports = {
    requireAuth,
    checkUser
};
