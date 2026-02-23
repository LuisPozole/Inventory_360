import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../config/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'ia',
            text: 'Hola, soy tu asistente de inventario. ¿En qué puedo ayudarte hoy?',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Simple markdown-like renderer for AI messages
    const renderMessage = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            // Convert **bold** to <strong>
            const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
            return (
                <span key={i}>
                    {i > 0 && <br />}
                    {parts}
                </span>
            );
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { sender: 'user', text: inputText };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // Fallback simple response if backend not connected
            /*
            setTimeout(() => {
              setMessages(prev => [...prev, { sender: 'ia', text: `Entendido: "${inputText}". (Simulación)` }]);
              setLoading(false);
            }, 1000);
            return;
            */

            const res = await api.post('/chat', { message: userMsg.text });

            setMessages((prev) => [
                ...prev,
                {
                    sender: 'ia',
                    text: res.data.message || 'Lo siento, hubo un error.',
                },
            ]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { sender: 'ia', text: 'Error de conexión con el servidor.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="chat-toggle-button" onClick={toggleChat} aria-label="Abrir chat">
                <FaComments />
            </button>
        );
    }

    return (
        <div className="chat-widget">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <FaRobot className="chat-header-icon" />
                    <span>Asistente IA</span>
                </div>
                <button className="chat-close-button" onClick={toggleChat} aria-label="Cerrar chat">
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'user' : 'ia'}`}>
                        {msg.sender === 'ia' && (
                            <div className="message-avatar ia">
                                <FaRobot />
                            </div>
                        )}
                        <div className="message-bubble">
                            <div className="message-text">
                                {msg.sender === 'ia' ? renderMessage(msg.text) : msg.text}
                            </div>
                            <div className="message-time">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        {msg.sender === 'user' && (
                            <div className="message-avatar user">
                                <FaUser />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="chat-message ia">
                        <div className="message-avatar ia">
                            <FaRobot />
                        </div>
                        <div className="message-bubble">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-form" onSubmit={handleSend}>
                <input
                    ref={inputRef}
                    type="text"
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="chat-send-button"
                    disabled={!inputText.trim() || loading}
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatWidget;