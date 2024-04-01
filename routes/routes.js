const express = require('express');
const router = express.Router();
const Menu = require('../public/menus');
const multer = require('multer');

// image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single('image');

// Insert menu into database route
router.post('/add', upload, (req,res) => {
    const menu = new Menu({
        name: req.body.name,
        ingredient: req.body.ingredient,
        price: req.body.price,
        image: req.file.filename,
    });
    menu.save()
    .then(() => {
        req.session.message = {
            type: 'success',
            message: 'Menu added successfully!'
        };
        res.redirect("/");
    })
    .catch(err => {
        res.json({message: err.message, typeof: 'danger'});
    });
});

// Get all menus route
router.get('/', (req, res) =>{
    Menu.find().exec() // Hapus callback dari exec()
    .then(menus => { // Handle hasil query di dalam .then()
        res.render('index', {
            title: 'Home Page',
            menus: menus, 
        });
    })
    .catch(err => { // Tangani kesalahan di dalam .catch()
        res.json({ message: err.message });
    });
});

// Render add menu page route
router.get('/add', (req, res) =>{
    res.render("add_menus", {title: "Add Menus"});
});

module.exports = router;
