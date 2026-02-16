import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ia', text: 'Hola, soy tu asistente de inventario. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { sender: 'user', text: inputText };
        setMessages(prev => [...prev, userMsg]);
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

            setMessages(prev => [...prev, {
                sender: 'ia',
                text: res.data.message || "Lo siento, hubo un error."
            }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { sender: 'ia', text: "Error de conexión con el servidor." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="chat-widget minimized" onClick={toggleChat}>
                <span style={{ fontSize: '24px' }}>💬</span>
            </div>
        );
    }

    return (
        <div className="chat-widget glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Asistente IA</strong>
                <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✖</button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="message ai">Thinking...</div>}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Escribe una instrucción..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="btn-primary">➤</button>
            </form>
        </div>
    );
};

export default ChatWidget;
