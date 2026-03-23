import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMicrophone, FaTimes, FaSpinner, FaMicrophoneSlash, FaPaperPlane } from 'react-icons/fa';
import api from '../config/api';
import './VoiceChatOverlay.css';

const VoiceChatOverlay = ({ onClose, userData, onMessageComplete }) => {
    // ─── UI State ───
    const [status, setStatus] = useState('greeting'); // greeting | listening | processing | playing | idle
    const [displayText, setDisplayText] = useState('');
    const [responseText, setResponseText] = useState('');

    // ─── Refs (avoid stale closures) ───
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const accumulatedTextRef = useRef('');
    const lastHeardTextRef = useRef(''); // Persists across recognition restarts
    const statusRef = useRef('greeting');
    const isSendingRef = useRef(false);
    const sendToBackendRef = useRef(null);
    const closedRef = useRef(false);
    const voiceHistoryRef = useRef([]);

    // Audio / Animation refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const circleRef = useRef(null);
    const animationFrameRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const micStreamRef = useRef(null);

    const firstName = userData?.name ? userData.name.split(' ')[0] : 'Usuario';

    // Keep statusRef in sync
    const updateStatus = useCallback((newStatus) => {
        statusRef.current = newStatus;
        setStatus(newStatus);
    }, []);

    // ─── Audio Animation ───
    const startAnimation = useCallback((sourceNode) => {
        if (!circleRef.current) return;
        const audioCtx = audioContextRef.current;
        if (!audioCtx) return;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        sourceNode.connect(analyser);

        const animate = () => {
            if (!analyserRef.current || !circleRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            const scale = 1 + (avg / 255) * 0.8;
            circleRef.current.style.transform = `scale(${scale})`;
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
    }, []);

    const stopAnimation = useCallback(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (circleRef.current) circleRef.current.style.transform = 'scale(1)';
    }, []);

    // ─── Mic Stream for circle animation while listening ───
    const startMicVisualization = useCallback(async () => {
        try {
            const audioCtx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            if (!micStreamRef.current) {
                micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            const source = audioCtx.createMediaStreamSource(micStreamRef.current);
            startAnimation(source);
        } catch (e) {
            console.warn('Mic visualization error:', e);
        }
    }, [startAnimation]);

    const stopMicVisualization = useCallback(() => {
        stopAnimation();
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
        }
    }, [stopAnimation]);

    // ─── Speech Recognition Setup (runs ONCE) ───
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setDisplayText('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-MX';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            updateStatus('listening');
            setDisplayText('Escuchando...');
            startMicVisualization();
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            const heard = (final || interim).trim();
            accumulatedTextRef.current = heard;
            if (heard.length > 0) {
                lastHeardTextRef.current = heard;
            }
            setDisplayText(heard || 'Escuchando...');

            // Reset silence timer each time we get a result
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                const text = lastHeardTextRef.current.trim();
                if (text.length > 1 && !isSendingRef.current) {
                    sendToBackendRef.current?.(text);
                }
            }, 2000);
        };

        recognition.onerror = (event) => {
            console.warn('SpeechRecognition error:', event.error);
        };

        recognition.onend = () => {
            stopMicVisualization();

            // If we're closed, sending, or playing, don't restart
            if (closedRef.current) return;
            if (isSendingRef.current) return;
            if (statusRef.current === 'processing' || statusRef.current === 'playing') return;

            // Always just restart listening — let the silence timer or manual button handle sending
            setTimeout(() => {
                if (statusRef.current === 'listening' || statusRef.current === 'idle') {
                    // Don't clear lastHeardTextRef — keep the text available for manual send
                    accumulatedTextRef.current = '';
                    isSendingRef.current = false;
                    try {
                        recognitionRef.current?.start();
                        startMicVisualization();
                    } catch (e) {
                        console.warn('Restart error:', e);
                    }
                }
            }, 150);
        };

        recognitionRef.current = recognition;

        return () => {
            clearTimeout(silenceTimerRef.current);
            try { recognition.abort(); } catch (e) { }
            stopMicVisualization();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ← EMPTY dependency array: setup only once!

    // ─── Core Functions ───

    const beginListening = useCallback(() => {
        if (!recognitionRef.current || closedRef.current) return;
        accumulatedTextRef.current = '';
        lastHeardTextRef.current = ''; // Clear on fresh start
        isSendingRef.current = false;
        updateStatus('listening');
        setDisplayText('Escuchando...');
        setResponseText('');
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.warn('Recognition start error:', e);
        }
    }, [updateStatus]);

    // ─── Browser TTS Fallback ───
    const speakWithBrowserTTS = useCallback((text) => {
        return new Promise((resolve) => {
            const synth = synthRef.current;
            if (!synth) {
                console.warn('SpeechSynthesis not available');
                resolve();
                return;
            }
            synth.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-MX';
            utterance.rate = 1.15;   // Faster for a more dynamic feel
            utterance.pitch = 1.15;  // Warmer, friendlier tone
            utterance.volume = 1.0;

            // Pick the best available Spanish voice (optimized for Chrome)
            const voices = synth.getVoices();
            const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

            // Chrome has great Google voices — prioritize those
            const preferredVoice =
                spanishVoices.find(v => /google español/i.test(v.name)) ||          // Google Español (Chrome, very natural)
                spanishVoices.find(v => /google/i.test(v.name)) ||                  // Any Google voice
                spanishVoices.find(v => /dalia|sabina|larissa/i.test(v.name)) ||    // Microsoft premium (Edge)
                spanishVoices.find(v => /microsoft/i.test(v.name)) ||               // Any Microsoft voice
                spanishVoices.find(v => v.name.toLowerCase().includes('female')) ||  // Prefer female
                spanishVoices.find(v => !v.localService) ||                         // Online = better quality
                spanishVoices[0];

            if (preferredVoice) {
                utterance.voice = preferredVoice;
                console.log('Using TTS voice:', preferredVoice.name, preferredVoice.lang);
            }

            updateStatus('playing');

            utterance.onend = () => {
                isSendingRef.current = false;
                setTimeout(() => beginListening(), 400);
                resolve();
            };
            utterance.onerror = (e) => {
                console.error('Browser TTS error:', e);
                isSendingRef.current = false;
                setTimeout(() => beginListening(), 500);
                resolve();
            };
            synth.speak(utterance);
        });
    }, [updateStatus, beginListening]);

    const sendToBackend = useCallback(async (text) => {
        console.log("--> attempt sendToBackend with text:", text, "isSendingRef:", isSendingRef.current);
        if (isSendingRef.current) return; // prevent double sends
        isSendingRef.current = true;
        clearTimeout(silenceTimerRef.current);

        // Stop recognition if still active
        try { recognitionRef.current?.abort(); } catch (e) { }
        stopMicVisualization();
        updateStatus('processing');
        setDisplayText(`"${text}"`);

        try {
            console.log("--> POST /chat/voice executing...");
            const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
            const aiTone = prefs.aiTone || 'Profesional';

            const res = await api.post('/chat/voice', {
                text: text,
                history: voiceHistoryRef.current,
                aiTone: aiTone
            });

            console.log("--> POST /chat/voice success:", res.data);
            setResponseText(res.data.message);

            // Track conversation history for step-by-step flows
            voiceHistoryRef.current.push(
                { role: 'user', content: text },
                { role: 'assistant', content: res.data.message }
            );

            if (onMessageComplete) {
                onMessageComplete(
                    { text: text, sender: 'user', timestamp: new Date() },
                    { text: res.data.message, sender: 'ia', timestamp: new Date() }
                );
            }

            // Use browser TTS to speak the response
            await speakWithBrowserTTS(res.data.message);
        } catch (error) {
            console.error('Voice API error:', error);
            setDisplayText('Error al procesar. Intentando de nuevo...');
            isSendingRef.current = false;
            setTimeout(() => beginListening(), 1500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateStatus, onMessageComplete]);

    // Keep ref in sync so closures always call the latest version
    sendToBackendRef.current = sendToBackend;

    const playAudio = null; // Removed: TTS is handled by browser SpeechSynthesis

    // ─── Initial Greeting (runs ONCE) ───
    useEffect(() => {
        const greet = async () => {
            updateStatus('processing');
            setResponseText(`Hola ${firstName}, ¿en qué te puedo ayudar?`);
            try {
                const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
                const aiTone = prefs.aiTone || 'Profesional';

                const res = await api.post('/chat/voice', {
                    text: `Saluda brevemente al usuario llamándolo "${firstName}". Di algo como "Hola ${firstName}, estoy listo para ayudarte" de forma breve y cálida. Usa pronombres masculinos.`,
                    history: [],
                    aiTone: aiTone
                });
                setResponseText(res.data.message);
                await speakWithBrowserTTS(res.data.message);
            } catch (error) {
                console.error('Greeting error:', error);
                // Fallback: speak the default greeting
                await speakWithBrowserTTS(`Hola ${firstName}, ¿en qué te puedo ayudar?`);
            }
        };

        // Small delay to let audio context initialize
        const timer = setTimeout(greet, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Manual send ───
    const handleManualSend = () => {
        const text = (lastHeardTextRef.current || accumulatedTextRef.current).trim();
        console.log("--> handleManualSend clicked. Text:", text, "isSending:", isSendingRef.current);
        if (text.length > 1 && !isSendingRef.current) {
            sendToBackendRef.current?.(text);
        } else {
            console.log("--> handleManualSend ignored: text too short or already sending.");
        }
    };

    // ─── Manual toggle (tap the circle) ───
    const handleCircleTap = () => {
        if (status === 'listening') {
            handleManualSend();
        } else if (status === 'idle') {
            beginListening();
        }
    };

    // ─── Close handler ───
    const handleClose = () => {
        closedRef.current = true;
        clearTimeout(silenceTimerRef.current);
        voiceHistoryRef.current = [];
        // Stop speech recognition
        try { recognitionRef.current?.abort(); } catch (e) { }
        recognitionRef.current = null;
        // Stop browser TTS
        if (synthRef.current) synthRef.current.cancel();
        // Stop mic visualization and audio context
        stopMicVisualization();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
        }
        onClose();
    };

    // ─── Render ───
    const isActive = status === 'listening' || status === 'playing';

    return (
        <div className="voice-overlay-container fade-in">
            <button className="voice-overlay-close" onClick={handleClose}>
                <FaTimes size={24} />
            </button>

            <div className="voice-overlay-content">
                <h2 className="voice-title">Asistente de Voz IA</h2>

                <div className="voice-circle-container">
                    <div
                        className={`voice-circle ${isActive ? 'active' : ''}`}
                        ref={circleRef}
                    />
                    <div
                        className="voice-circle-inner"
                        onClick={handleCircleTap}
                        style={{ cursor: 'pointer' }}
                    >
                        {status === 'processing' ? (
                            <FaSpinner className="spinner-icon voice-spin" />
                        ) : status === 'playing' ? (
                            <FaMicrophone size={50} color="var(--accent-light)" />
                        ) : status === 'listening' ? (
                            <FaMicrophone size={50} color="var(--primary-color)" />
                        ) : (
                            <FaMicrophoneSlash size={50} color="#666" />
                        )}
                    </div>
                </div>

                <div className="voice-text-area">
                    {(status === 'listening' || status === 'idle') && displayText && (
                        <p className="voice-transcript">"{displayText}"</p>
                    )}
                    {(status === 'processing' || status === 'playing') && responseText && (
                        <p className="voice-response">{responseText}</p>
                    )}
                </div>

                <div className="voice-controls">
                    {status === 'listening' ? (
                        <div className="voice-controls-row">
                            <p className="voice-playing-text">Habla ahora...</p>
                            <button className="voice-send-btn" onClick={handleManualSend} title="Enviar ahora">
                                <FaPaperPlane size={18} />
                                <span>Enviar</span>
                            </button>
                        </div>
                    ) : (
                        <p className="voice-playing-text">
                            {status === 'processing'
                                ? 'Pensando...'
                                : status === 'playing'
                                    ? 'Asistente hablando...'
                                    : status === 'greeting'
                                        ? 'Conectando...'
                                        : 'Toca el círculo para hablar'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChatOverlay;
