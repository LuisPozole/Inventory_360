import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTrashAlt, FaClock, FaComments, FaPlus } from 'react-icons/fa';
import api from '../config/api';
import './ChatPage.css';

const ChatPage = ({ userData }) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [messages, setMessages] = useState([
        { sender: 'ia', text: `Hola${userData?.name ? ' ' + userData.name.split(' ')[0] : ''}, soy tu asistente de Inventory 360. ¿En qué puedo ayudarte hoy?`, timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Simple markdown renderer for AI messages
    const renderMessage = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
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

    useEffect(() => {
        inputRef.current?.focus();
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/chat/history');
            setHistoryLogs(res.data);
        } catch (err) {
            console.error('Error fetching chat history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete('/chat/history');
            setHistoryLogs([]);
        } catch (err) {
            console.error('Error clearing history:', err);
        }
    };

    const startNewChat = () => {
        setMessages([
            { sender: 'ia', text: 'Hola, soy tu asistente de Inventory 360. ¿En qué puedo ayudarte hoy?', timestamp: new Date() }
        ]);
        inputRef.current?.focus();
    };

    // Group history by date
    const groupedHistory = historyLogs.reduce((groups, log) => {
        const date = new Date(log.timestamp).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
        return groups;
    }, {});

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMsg = { sender: 'user', text: inputText, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const history = messages.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const res = await api.post('/chat', { message: userMsg.text, history });

            const iaMsg = {
                sender: 'ia',
                text: res.data.message || 'Lo siento, hubo un error.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, iaMsg]);

            // Refresh history after each exchange
            fetchHistory();
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                sender: 'ia',
                text: 'Error de conexión con el servidor.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chatpage-container">
            {/* Section Header */}
            <div className="chatpage-header">
                <div>
                    <h1 className="chatpage-title">Sección: ChatBot</h1>
                    <h2 className="chatpage-subtitle">Asistente de Inventario IA</h2>
                    <p className="chatpage-description">Gestiona tu inventario mediante comandos de lenguaje natural</p>
                </div>
            </div>

            <div className="chatpage-body">
                {/* History Sidebar */}
                <div className={`chatpage-history ${showHistory ? 'open' : ''}`}>
                    <div className="chatpage-history-header">
                        <h3><FaClock /> Historial</h3>
                        <div className="chatpage-history-actions">
                            <button className="chatpage-new-btn" onClick={startNewChat} title="Nueva conversación">
                                <FaPlus />
                            </button>
                            {historyLogs.length > 0 && (
                                <button className="chatpage-clear-btn" onClick={clearHistory} title="Borrar historial">
                                    <FaTrashAlt />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="chatpage-history-list">
                        {historyLoading ? (
                            <div className="chatpage-history-empty">Cargando...</div>
                        ) : Object.keys(groupedHistory).length === 0 ? (
                            <div className="chatpage-history-empty">
                                <FaComments size={24} />
                                <p>Sin historial</p>
                            </div>
                        ) : (
                            Object.entries(groupedHistory).reverse().map(([date, logs]) => (
                                <div key={date} className="chatpage-history-group">
                                    <div className="chatpage-history-date">{date}</div>
                                    {logs.map((log, i) => (
                                        <div key={log._id || i} className={`chatpage-history-item ${log.sender === 'Usuario' ? 'user' : 'ia'}`}>
                                            <div className="chatpage-history-sender">
                                                {log.sender === 'Usuario' ? <FaUser /> : <FaRobot />}
                                                <span>{log.sender}</span>
                                                <span className="chatpage-history-time">{formatTime(log.timestamp)}</span>
                                            </div>
                                            <p className="chatpage-history-msg">{log.message?.substring(0, 80)}{log.message?.length > 80 ? '...' : ''}</p>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="chatpage-main">
                    {/* Toggle history on mobile */}
                    <button className="chatpage-toggle-history" onClick={() => setShowHistory(!showHistory)}>
                        <FaClock /> {showHistory ? 'Ocultar' : 'Historial'}
                    </button>

                    <div className="chatpage-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chatpage-message ${msg.sender === 'user' ? 'user' : 'ia'}`}>
                                {msg.sender === 'ia' && (
                                    <div className="chatpage-avatar ia">
                                        <FaRobot />
                                    </div>
                                )}
                                <div className="chatpage-bubble">
                                    <div className="chatpage-text">
                                        {msg.sender === 'ia' ? renderMessage(msg.text) : msg.text}
                                    </div>
                                    <div className="chatpage-time">{formatTime(msg.timestamp)}</div>
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="chatpage-avatar user">
                                        {userData?.profileImage ? (
                                            <img src={`${API_BASE}${userData.profileImage}`} alt={userData.name} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="chatpage-message ia">
                                <div className="chatpage-avatar ia">
                                    <FaRobot />
                                </div>
                                <div className="chatpage-bubble">
                                    <div className="chatpage-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatpage-input-form" onSubmit={handleSend}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="chatpage-input"
                            placeholder="Escribe un mensaje... (ej: 'Añade 10 laptops, precio $15000, categoría electrónica')"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="chatpage-send-btn"
                            disabled={!inputText.trim() || loading}
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
