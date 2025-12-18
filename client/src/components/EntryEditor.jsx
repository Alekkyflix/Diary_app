import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, Heart, Type, Image as ImageIcon, MapPin, Mic } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';

import AudioRecorder from './AudioRecorder';

export default function EntryEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('');
    const [showRecorder, setShowRecorder] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const navigate = useNavigate();
    const { id } = useParams(); // Added for editing existing entries

    // Assuming formData is used for editing existing entries,
    // and individual states for new entries or when editing specific fields.
    // This state will be populated if 'id' is present in the URL.
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        mood: '',
        audioUrl: null, // To store URL of existing audio
        selectedGroupId: ''
    });

    const moods = ['😊', '😐', '😔', '😡', '😴', '🤩'];

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data);
            } catch (err) {
                console.error("Failed to fetch groups", err);
            }
        };
        fetchGroups();

        const fetchEntry = async () => {
            if (id) { // Only fetch if an ID is present (editing mode)
                try {
                    const res = await api.get(`/entries/${id}`);
                    const entryData = res.data;
                    setTitle(entryData.title);
                    setContent(entryData.content);
                    setMood(entryData.mood);
                    setAudioBlob(entryData.audioUrl ? new Blob([], { type: 'audio/webm' }) : null); // Placeholder for existing audio
                    setFormData(entryData); // Populate formData for other fields if needed
                } catch (err) {
                    console.error("Failed to fetch entry", err);
                }
            }
        };
        fetchEntry();

        const handleKeyDown = (e) => {
            // Allow keys 1-6 to select mood
            const key = parseInt(e.key);
            if (key >= 1 && key <= 6 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                setMood(moods[key - 1]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [id]); // Re-run effect if ID changes

    const handleAudioSave = (blob) => {
        setAudioBlob(blob);
        // In a real app, we would upload this blob to the server
        // For now we will just acknowledge it
        alert("Voice Note recorded! (Note: File upload to server is not yet implemented, but the blob is captured)");
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('mood', mood);
            if (audioBlob) {
                formData.append('audio', audioBlob, 'voice_note.webm');
            }

            await axios.post('http://localhost:5000/api/entries', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Share to Group if selected
            if (selectedGroupId) {
                await axios.post(`http://localhost:5000/api/groups/${selectedGroupId}/messages`,
                    { content: `📖 **Shared Entry: ${title}**\n\n${content}` },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Failed to save entry');
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {showRecorder && (
                <AudioRecorder
                    onClose={() => setShowRecorder(false)}
                    onSave={handleAudioSave}
                />
            )}

            <div style={{ marginBottom: '20px' }}>
                <Link to="/" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            <input
                type="text"
                placeholder="Title of your day..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ fontSize: '1.5em', fontWeight: 'bold', background: 'transparent', border: 'none', borderBottom: '1px solid var(--glass-border)', paddingLeft: 0, color: 'white' }}
            />

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => setShowRecorder(true)} className="btn-icon" style={{
                    background: audioBlob ? 'rgba(8, 217, 214, 0.2)' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    width: 40, height: 40, borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {audioBlob ? <Volume2 size={20} color="#08D9D6" /> : <Mic size={20} />}
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {moods.map((m, index) => (
                        <button
                            key={m}
                            onClick={() => setMood(m)}
                            title={`Press ${index + 1}`}
                            style={{
                                background: mood === m ? 'rgba(255, 46, 99, 0.4)' : 'rgba(255,255,255,0.05)',
                                border: mood === m ? '2px solid #FF2E63' : '1px solid transparent',
                                fontSize: '1.5em',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: 44,
                                height: 44,
                                transform: mood === m ? 'scale(1.15)' : 'scale(1)',
                                boxShadow: mood === m ? '0 0 15px rgba(255, 46, 99, 0.5)' : 'none',
                                transition: 'all 0.2s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            {m}
                            <span style={{
                                position: 'absolute', bottom: -5, right: -5,
                                fontSize: '0.4em', background: 'var(--glass-bg)',
                                borderRadius: '50%', width: 14, height: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>{index + 1}</span>
                        </button>
                    ))}
                </div>
            </div>

            <textarea
                placeholder="Start writing..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ flex: 1, resize: 'none', fontSize: '1.1em', lineHeight: '1.6', background: 'transparent', border: 'none', color: 'white' }}
            ></textarea>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                    value={selectedGroupId}
                    onChange={e => setSelectedGroupId(e.target.value)}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '10px', borderRadius: '8px', outline: 'none'
                    }}
                >
                    <option value="" style={{ color: 'black' }}>🔒 Private (Don't Share)</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id} style={{ color: 'black' }}>👥 Share to {g.name}</option>
                    ))}
                </select>
                <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} /> Save Entry
                </button>
            </div>
            <style>{`
            .pulse { animation: pulse 1.5s infinite; }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `}</style>
        </div>
    );
}
