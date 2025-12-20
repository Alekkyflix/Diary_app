import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { Save, ArrowLeft, Trash2, Heart, Type, Image as ImageIcon, MapPin, Mic, Volume2 } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';


import AudioRecorder from './AudioRecorder';
import CustomAlert from './CustomAlert';

export default function EntryEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('');
    const [showRecorder, setShowRecorder] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [groups, setGroups] = useState([]);
    const [visibility, setVisibility] = useState('private'); // 'private', 'public', or groupID
    const [isSaved, setIsSaved] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', mode: 'alert', onConfirm: null });
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
                    setAudioBlob(entryData.audioUrl ? new Blob([], { type: 'audio/webm' }) : null);
                    setIsSaved(true); // Existing entries are "saved" until modified
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

    const triggerAlert = (config) => {
        setAlertConfig({ ...alertConfig, isOpen: true, ...config });
    };

    const handleAudioSave = (blob) => {
        setAudioBlob(blob);
        triggerAlert({
            type: 'success',
            title: 'Note Recorded',
            message: 'Voice Note recorded! (Note: File upload functionality is coming soon, but your note is captured locally for now).'
        });
    };

    const getWordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
    const wordCount = getWordCount(content);

    const handleBack = () => {
        const hasChanges = title || content || audioBlob;
        if (hasChanges && !isSaved) {
            triggerAlert({
                type: 'warning',
                title: 'Discard Changes?',
                message: 'You have unsaved changes. Are you sure you want to discard them?',
                mode: 'confirm',
                onConfirm: () => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    navigate('/');
                }
            });
        } else {
            navigate('/');
        }
    };

    const handleSave = async () => {
        if (visibility === 'public' && wordCount > 20) {
            triggerAlert({
                type: 'error',
                title: 'Story too long',
                message: 'Public stories must be 20 words or less. Please shorten your note.'
            });
            return;
        }

        try {
            const formDataToUpload = new FormData();
            formDataToUpload.append('title', title);
            formDataToUpload.append('content', content);
            formDataToUpload.append('mood', mood);
            if (audioBlob) {
                formDataToUpload.append('audio', audioBlob, 'voice_note.webm');
            }

            await api.post('/entries', formDataToUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // If visibility is a group ID
            if (visibility !== 'private' && visibility !== 'public') {
                await api.post(`/groups/${visibility}/messages`,
                    { content: `📖 **Shared Entry: ${title}**\n\n${content}` }
                );
            }

            // If visibility is public, share as Story (Snap)
            if (visibility === 'public') {
                // Generate a simple text-to-image SNAP (placeholder for now, will refine)
                await api.post('/api/snaps', {
                    caption: title,
                    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(content.substring(0, 10))}&background=random&size=512&color=fff&bold=true&length=5`, // Dynamic placeholder
                    song: { title: 'Diary Story', artist: 'Me' }
                });
            }

            setIsSaved(true);
            navigate('/');
        } catch (err) {
            console.error(err);
            triggerAlert({
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save your entry. Please try again.'
            });
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
                <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0 }}>
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <input
                type="text"
                placeholder="Title of your day..."
                value={title}
                onChange={e => { setTitle(e.target.value); setIsSaved(false); }}
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
                onChange={e => { setContent(e.target.value); setIsSaved(false); }}
                style={{ flex: 1, resize: 'none', fontSize: '1.1em', lineHeight: '1.6', background: 'transparent', border: 'none', color: 'white' }}
            ></textarea>

            {visibility === 'public' && (
                <div style={{ fontSize: '0.8em', opacity: 0.7, textAlign: 'right', color: wordCount > 20 ? '#FF5F56' : 'white' }}>
                    {wordCount} / 20 words
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value)}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '10px', borderRadius: '8px', outline: 'none'
                    }}
                >
                    <option value="private" style={{ color: 'black' }}>🔒 Private (Don't Share)</option>
                    <option value="public" style={{ color: 'black' }}>🌍 Public (Share as Story)</option>
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
            
            <CustomAlert 
                {...alertConfig} 
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} 
            />
        </div>
    );
}
