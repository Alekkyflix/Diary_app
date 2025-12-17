import React, { useState } from 'react';
import { Mic, Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EntryEditor() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const navigate = useNavigate();
    let recognition = null;

    if ('webkitSpeechRecognition' in window) {
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
    }

    const toggleSpeech = () => {
        if (!recognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognition.stop();
            setIsRecording(false);
        } else {
            recognition.start();
            setIsRecording(true);

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setContent(prev => prev + finalTranscript + ' ');
            };

            recognition.onerror = (event) => {
                console.error(event.error);
                setIsRecording(false);
            };
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/entries', { title, content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/');
        } catch (err) {
            alert('Failed to save entry');
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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

            <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <button onClick={toggleSpeech} className="btn-icon" style={{
                    background: isRecording ? 'rgba(255, 46, 99, 0.2)' : 'rgba(255,255,255,0.1)',
                    border: isRecording ? '1px solid var(--accent-color)' : 'none',
                    width: 40, height: 40, borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Mic className={isRecording ? 'pulse' : ''} size={20} />
                </button>
            </div>

            <textarea
                placeholder="Start writing..."
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ flex: 1, resize: 'none', fontSize: '1.1em', lineHeight: '1.6', background: 'transparent', border: 'none', color: 'white' }}
            ></textarea>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
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
