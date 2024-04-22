const express = require('express');
const router = express.Router();
const Menu = require('../public/menus');
const multer = require('multer');
const fs = require('fs');


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
        res.redirect("/index");
    })
    .catch(err => {
        res.json({message: err.message, typeof: 'danger'});
    });
});

// Get all menus route
router.get('/index', (req, res) =>{
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

// Edit menu route
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.redirect("/index");
        }
        res.render("edit_menus", {
            title: "Edit Menu",
            menu: menu,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/index");
    }
});

// Update menu route
router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = '';

        if(req.file){
            new_image = req.file.filename;
            try{
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch(err){
                console.error(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const updatedMenu = await Menu.findByIdAndUpdate(id, {
            name: req.body.name,
            price: req.body.price,
            image: new_image,
        });

        if (!updatedMenu) {
            return res.json({ message: 'Menu not found', type: 'danger' });
        }

        req.session.message = {
            type: 'success',
            message: 'Menu updated successfully!',
        };
        res.redirect('/#menu');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete menu route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const menu = await Menu.findById(id);

        if (!menu) {
            return res.json({ message: 'Menu not found' });
        }

        if (menu.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + menu.image);
            } catch (err) {
                console.error(err);
            }
        }

        const deletedMenu = await Menu.findByIdAndDelete(id);

        if (!deletedMenu) {
            return res.json({ message: 'Failed to delete menu' });
        }

        req.session.message = {
            type: 'info',
            message: 'Menu deleted successfully!',
        };
        res.redirect('/#menu');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});



module.exports = router;
