const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

const User = require('../models/User');

// Endpoint untuk mengambil data nama dari MongoDB
router.get('/nama', async (req, res) => {
    try {
        const users = await User.find();
        const nama = users.map(user => user.name);
        res.json(nama);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
    