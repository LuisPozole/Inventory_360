const axios = require('axios');

/**
 * Perform Text-To-Speech with ElevenLabs
 */
async function tts(text) {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey || apiKey === 'tu_api_key_aqui') {
            console.warn("ElevenLabs API key no configurada devolviendo dummy");
            return null; // El frontend lo ignorará si no hay base64
        }

        // Voice ID for "Rachel" (calm, female, professional) 
        // using eleven_multilingual_v2 model to support Spanish
        const voiceId = "21m00Tcm4TlvDq8ikWAM";

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const data = {
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };

        const config = {
            method: 'post',
            url: url,
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            data: data,
            responseType: 'arraybuffer'
        };

        const response = await axios.request(config);
        const buffer = Buffer.from(response.data, 'binary');
        return buffer.toString('base64');
    } catch (error) {
        console.error("Error en TTS (ElevenLabs):", error.message);
        return null;
    }
}

module.exports = {
    tts
};
