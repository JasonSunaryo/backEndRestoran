const express = require('express');
const router = express.Router();
const Menu = require('../models/menus');
const Suggestion = require('../models/suggestions');
const multer = require('multer');
const fs = require('fs');
const Reservation = require('../models/Reservation');
const User = require('../models/user'); // Import model User
const { requireAuth } = require('../middlewares/authMiddlewares');

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
router.get('/index', async (req, res) =>{
    const suggestions = await Suggestion.find();
    const reservations = await Reservation.find().exec(); // Ambil semua reservasi dari database
    Menu.find().exec() // Hapus callback dari exec()
    .then(menus => { // Handle hasil query di dalam .then()
        res.render('index', {
            title: 'Home Page',
            menus: menus,
            suggestions:suggestions,
            reservations: reservations 
        });
    })
    .catch(err => { // Tangani kesalahan di dalam .catch()
        res.json({ message: err.message });
    });
});

// Get all menus route
router.get('/main', requireAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Mendapatkan userId dari objek req.user
        const menus = await Menu.find().exec();

        // Render halaman main.ejs dengan data reservasi yang sesuai
        res.render('main', {
            title: 'Main Page',
            menus: menus
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
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
            return res.redirect("/");
        }
        res.render("edit_menus", {
            title: "Edit Menu",
            menu: menu,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
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
        res.redirect("/index");
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
        res.redirect("/index");
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

// Route untuk menambahkan feedback ke database
router.post('/feedback', async (req, res) => {
    try {
        const newSuggestion = new Suggestion({
            nama: req.body.nama, // Mengambil nama dari form
            feedback: req.body.feedback,
            waktu_pengiriman: new Date() // Mendapatkan waktu saat ini
        });
        await newSuggestion.save();
        req.session.message = {
            type: 'success',
            message: 'Feedback added successfully!'
        };
        res.redirect("/main");
    } catch (error) {
        res.json({ message: error.message, type: 'danger' });
    }
});

router.post('/users/:id/reservation', requireAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const loggedInUserId = req.params.id;

        if (userId !== loggedInUserId.toString()) {
            return res.status(403).json({ message: 'Forbidden' }); // Jika ID pengguna yang diminta tidak sesuai dengan ID pengguna yang saat ini masuk, kembalikan kode status 403 (Forbidden)
        }

        const { name, phone, person, reservationDate, reservationTime, message } = req.body;

        const reservation = new Reservation({
            name,
            phone,
            person,
            reservationDate,
            reservationTime,
            message,
            user: userId // Simpan referensi ke pengguna yang membuat reservasi
        });

        await reservation.save();

        // Simpan ID reservasi ke daftar reservasi pengguna
        await User.findByIdAndUpdate(userId, { $push: { reservations: reservation._id } });

        res.redirect('/main'); // Redirect ke halaman utama setelah reservasi dibuat
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/users/:id/reservation', requireAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const loggedInUserId = req.params.id;

        if (userId !== loggedInUserId.toString()) {
            return res.status(403).json({ message: 'Forbidden' }); // Jika ID pengguna yang diminta tidak sesuai dengan ID pengguna yang saat ini masuk, kembalikan kode status 403 (Forbidden)
        }

        // Ambil daftar reservasi berdasarkan ID pengguna
        const user = await User.findById(userId).populate('reservations');

        res.render('reservation', {
            title: 'Your Reservations',
            reservations: user.reservations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/user/:id/reservation/:reservationId/delete', requireAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const reservationId = req.params.reservationId;

        // Hapus reservasi dari database
        const deletedReservation = await Reservation.findByIdAndDelete(reservationId);

        if (!deletedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Hapus referensi reservasi dari daftar reservasi pengguna
        await User.findByIdAndUpdate(userId, { $pull: { reservations: reservationId } });

        req.session.message = {
            type: 'info',
            message: 'Reservation deleted successfully!',
        };
        res.redirect('/main'); // Redirect ke halaman utama setelah reservasi dihapus
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Render form to update reservation
router.get('/user/:id/reservation/:reservationId/update', requireAuth, async (req, res) => {
    try {
        const reservationId = req.params.reservationId;

        // Dapatkan reservasi yang akan diperbarui
        const reservation = await Reservation.findById(reservationId);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.render('update_reservation', {
            title: 'Update Reservation',
            reservation: reservation
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Handle update reservation request
router.post('/user/:id/reservation/:reservationId/update', requireAuth, async (req, res) => {
    try {
        const reservationId = req.params.reservationId;

        // Dapatkan data baru dari formulir
        const { name, phone, person, reservationDate, reservationTime, message } = req.body;

        // Update reservasi dalam database
        const updatedReservation = await Reservation.findByIdAndUpdate(reservationId, {
            name,
            phone,
            person,
            reservationDate,
            reservationTime,
            message
        });

        if (!updatedReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        req.session.message = {
            type: 'success',
            message: 'Reservation updated successfully!',
        };
        res.redirect('/main'); // Redirect ke halaman utama setelah reservasi diperbarui
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
