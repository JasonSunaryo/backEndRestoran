const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
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
