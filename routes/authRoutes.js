const {Router} = require('express')
const { requireAuth } = require('../middlewares/authMiddlewares');
const express = require('express');
const authController = require('../controllers/authController')
const User = require("../models/user");
const router = require('express').Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Atur direktori penyimpanan gambar

router.get('/signup',authController.signup_get);
router.post('/signup' ,authController.signup_post);

router.get('/login',authController.login_get);
router.post('/login',authController.login_post);

router.get('/logout',authController.logout_get);

router.post('/users/:id/updateName', async (req, res) => {
    const { id } = req.params;
    const newName = req.query.newName;
    try {
      const updatedUser = await User.findByIdAndUpdate(id, { name: newName }, { new: true });
      res.json(updatedUser);
    } catch (err) {
      console.error('Error updating name:', err);
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  })  

  router.delete('/users/:id/delete', async (req, res) => {
    const { id } = req.params;
    try {
        // Lakukan logika untuk menghapus pengguna dari database
        await User.findByIdAndDelete(id);
        res.clearCookie('jwt'); // Hapus cookie JWT
        res.sendStatus(200); // Kirim status 200 (OK) sebagai respons
    } catch (err) {
        console.error('Error deleting user:', err);
        res.sendStatus(500); // Kirim status 500 (Internal Server Error) jika terjadi kesalahan
    }
});


router.post('/users/:id/changeProfileImage', upload.single('profileImage'), async (req, res) => {
  const { id } = req.params;
  const profileImage = req.file.filename; // Ambil nama file gambar yang diunggah
  try {
      const updatedUser = await User.findByIdAndUpdate(id, { profileImage }, { new: true });
      res.json(updatedUser);
  } catch (err) {
      console.error('Error changing profile image:', err);
      res.status(400).json({ error: 'Failed to change profile image' });
  }
});

router.post('/users/:id/changePassword', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
      // Lakukan validasi password lama
      const user = await User.findById(id);
      const isPasswordCorrect = await user.comparePassword(oldPassword);
      if (!isPasswordCorrect) {
          return res.status(400).json({ error: 'Old password is incorrect' });
      }

      // Ubah password dengan yang baru
      user.password = newPassword;
      await user.save();

      res.sendStatus(200);
  } catch (err) {
      console.error('Error changing password:', err);
      res.status(400).json({ error: 'Failed to change password' });
  }
});




module.exports = router;