const mongoose = require('mongoose');
const User = require('./user'); // Import model User

const suggestionSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true
    },
    waktu_pengiriman: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referensi ke model User
    }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
