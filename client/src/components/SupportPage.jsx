import React, { useState } from 'react';
import api from '../api';

import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, ArrowLeft, LifeBuoy, Heart, AlertCircle, Send } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';


export default function SupportPage() {
    const [tab, setTab] = useState('resources'); // 'resources' or 'feedback'
    const [feedback, setFeedback] = useState('');
    const [type, setType] = useState('general');
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSend = async (e) => {
        e.preventDefault();
        try {
            await api.post('/feedback', { content: feedback, type });
            setSent(true);
            setFeedback('');
        } catch (err) {
            alert('Failed to send feedback');
        }
    };


    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'white', position: 'relative', zIndex: 10 }}>
            <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Support & Safety</h1>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => setTab('resources')}
                    style={{
                        flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: tab === 'resources' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                        color: tab === 'resources' ? 'black' : 'white', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                >
                    <LifeBuoy size={18} /> Helplines
                </button>
                <button
                    onClick={() => setTab('feedback')}
                    style={{
                        flex: 1, padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: tab === 'feedback' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                        color: tab === 'feedback' ? 'black' : 'white', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                >
                    <MessageSquare size={18} /> Feedback
                </button>
            </div>


            {tab === 'resources' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <TiltedGlassCard style={{ padding: '30px', borderColor: '#FF2E63' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <Phone size={32} color="#FF2E63" />
                            <h2>Emergency Services</h2>
                        </div>
                        <p style={{ marginBottom: '20px', opacity: 0.8 }}>Immediate help for life-threatening situations.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <a href="tel:1190" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', borderColor: '#FF2E63' }}>
                                🚑 1190 (Red Cross)
                            </a>
                            <a href="tel:999" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', borderColor: '#FF2E63' }}>
                                👮 999 (Police)
                            </a>
                        </div>
                    </TiltedGlassCard>

                    <TiltedGlassCard style={{ padding: '30px' }}>
                        <h3>Mental Health Support</h3>
                        <p style={{ marginBottom: '20px', opacity: 0.8 }}>Professional counseling and support.</p>
                        <a href="tel:1199" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                            📞 1199 (Befrienders Kenya)
                        </a>
                    </TiltedGlassCard>
                </div>
            )}

            {tab === 'feedback' && (
                <TiltedGlassCard style={{ padding: '30px' }}>
                    {sent ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                            <h2>Feedback Sent!</h2>
                            <p style={{ opacity: 0.7 }}>We've received your message. Thank you for your support!</p>
                            <button onClick={() => setSent(false)} style={{ marginTop: '20px', background: 'none', border: '1px solid white', color: 'white', padding: '12px 30px', borderRadius: '50px', cursor: 'pointer' }}>Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSend}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={24} /> Send Feedback</h2>
                             <p style={{ opacity: 0.7, marginBottom: '20px' }}>Found a bug? Have an idea? Tell us!</p>


                            <select
                                value={type} onChange={e => setType(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                <option value="general" style={{ color: 'black' }}>General Message</option>
                                <option value="bug" style={{ color: 'black' }}>Report a Bug 🐞</option>
                                <option value="feature" style={{ color: 'black' }}>Feature Request 💡</option>
                            </select>

                            <textarea
                                value={feedback} onChange={e => setFeedback(e.target.value)}
                                placeholder="Type your message here..."
                                rows="5"
                                style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', resize: 'none' }}
                                required
                            />

                            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Message</button>
                        </form>
                    )}
                </TiltedGlassCard>
            )}
        </div>
    );
}
