const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        default: 'Anonymous'
    },
    feedback: {
        type: String,
        required: true
    },
    waktu_pengiriman: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
