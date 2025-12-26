import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Users, Info, Settings } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';


export default function GroupChat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            await fetchGroup();
            await fetchMessages();
            setLoading(false);
        };
        fetchData();

        const interval = setInterval(fetchMessages, 3000); // Poll every 3s for new messages
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchGroup = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/groups/${id}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post(`/groups/${id}/messages`, { content: newMessage });
            setNewMessage('');
            fetchMessages(); // Refresh immediately
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', marginTop: '50px' }}>Loading space...</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, color: 'var(--text-primary)' }}>
            {/* Header */}
            <div style={{ padding: '20px 40px', background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/social')} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>←</button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{group?.name}</h2>
                        <span style={{ fontSize: '0.8em', opacity: 0.6, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px' }}>
                            Code: {group?.inviteCode}
                        </span>
                    </div>
                </div>
                <div style={{ color: '#08D9D6' }}>● Live</div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg, index) => {
                    const isMe = msg.User?.username === user?.username;
                    const isSystem = msg.isSystemMessage;

                    if (isSystem) {
                        return (
                            <div key={msg.id || index} style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8em', margin: '10px 0' }}>
                                {msg.User?.username} {msg.content}
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id || index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                            {!isMe && <div style={{ fontSize: '0.7em', paddingLeft: '10px', marginBottom: '2px', opacity: 0.7 }}>{msg.User?.username}</div>}
                            <div style={{
                                padding: '12px 18px',
                                borderRadius: '20px',
                                background: isMe ? 'linear-gradient(135deg, var(--accent-color), #FF0055)' : 'var(--glass-bg)',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid var(--glass-border)',
                                color: isMe ? 'var(--btn-text)' : 'var(--text-primary)',
                                borderBottomRightRadius: isMe ? '4px' : '20px',
                                borderBottomLeftRadius: isMe ? '20px' : '4px'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)', backdropFilter: 'blur(10px)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', maxWidth: '1000px', margin: '0 auto' }}>

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '30px', padding: '15px 25px', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
