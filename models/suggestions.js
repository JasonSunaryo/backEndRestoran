const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    feedback: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
