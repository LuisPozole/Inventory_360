const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
    globalCriticalThreshold: {
        type: Number,
        default: 10
    },
    themePreference: {
        type: String,
        default: 'light'
    }
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
