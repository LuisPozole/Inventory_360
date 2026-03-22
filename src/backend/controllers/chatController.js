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

// Handle Voice Chat (Text Input → Gemini → text response, TTS handled by browser)
exports.handleVoiceChat = async (req, res) => {
    const userId = req.user.id;
    const { text: transcribedText, history } = req.body;

    try {
        if (!transcribedText || transcribedText.length === 0) {
            return res.status(400).json({ message: 'No pude escuchar nada, intenta de nuevo.', action: 'UNKNOWN' });
        }

        console.log("Transcribed Input:", transcribedText);

        // 1. Log User Message
        await new ChatLog({
            user: userId,
            message: transcribedText,
            sender: 'Usuario'
        }).save();

        // 2. Process with Gemini (isVoice = true for spoken-friendly responses)
        const response = await geminiService.processCommand(transcribedText, history || [], true);

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
        res.status(500).send('Error en el servidor de chat de voz');
    }
};

