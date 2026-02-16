const geminiService = require('../services/geminiService');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User'); // If needed to verify user

exports.handleChat = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; // From Auth Middleware

    try {
        // 1. Log User Message
        await new ChatLog({
            user: userId,
            message: message,
            sender: 'Usuario'
        }).save();

        // 2. Process with Gemini
        const response = await geminiService.processCommand(message);

        // 3. Log IA Response
        await new ChatLog({
            user: userId,
            message: response.message,
            sender: 'IA',
            actionTaken: response.action !== 'UNKNOWN' ? response.action : null
        }).save();

        res.json(response);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor de chat');
    }
};
