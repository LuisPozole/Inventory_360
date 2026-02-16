const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        enum: ['Usuario', 'IA'],
        required: true
    },
    actionTaken: {
        type: String // Optional: Description of action performed by IA
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChatLog', chatLogSchema);
