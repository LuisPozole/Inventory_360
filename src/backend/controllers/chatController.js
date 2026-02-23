const geminiService = require('../services/geminiService');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User'); // If needed to verify user

exports.handleChat = async (req, res) => {
    const { message, history } = req.body;
    const userId = req.user.id; // From Auth Middleware

    try {
        // 1. Log User Message
        await new ChatLog({
            user: userId,
            message: message,
            sender: 'Usuario'
        }).save();

        // 2. Process with Gemini (pass history for context)
        const response = await geminiService.processCommand(message, history || []);

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

// Get chat history for the authenticated user
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await ChatLog.find({ user: userId })
            .sort({ timestamp: 1 })
            .lean();
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al obtener historial');
    }
};

// Delete all chat history for the authenticated user
exports.deleteChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        await ChatLog.deleteMany({ user: userId });
        res.json({ msg: 'Historial eliminado' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error al eliminar historial');
    }
};
