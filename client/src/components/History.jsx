import React, { useState, useEffect } from 'react';
import { Type, Camera, Mic, Layout, Smile, ArrowLeft, Search, Calendar, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import TiltedGlassCard from './TiltedGlassCard';

export default function History() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [snaps, setSnaps] = useState([]);
    const [filter, setFilter] = useState('all'); // all, text, photo, audio, emoji, reactions
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [entriesRes, snapsRes] = await Promise.all([
                api.get('/entries'),
                api.get('/snaps')
            ]);
            setEntries(entriesRes.data);
            
            // Filter snaps to only show those by current user for "My Reactions Activity"
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const mySnaps = snapsRes.data.filter(s => s.userId === currentUser.id || s.User?.username === currentUser.username);
            setSnaps(mySnaps);
            
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch history data", err);
            setLoading(false);
        }
    };

    const getEntryType = (entry) => {
        if (entry.photoData) return 'photo';
        if (entry.audioData) return 'audio';
        return 'text';
    };

    const tabs = [
        { id: 'all', label: 'All', icon: <Layout size={18} /> },
        { id: 'text', label: 'Texts', icon: <Type size={18} /> },
        { id: 'emoji', label: 'Moods', icon: <Smile size={18} /> },
        { id: 'photo', label: 'Photos', icon: <Camera size={18} /> },
        { id: 'audio', label: 'Audio', icon: <Mic size={18} /> },
        { id: 'reactions', label: 'Reactions', icon: <Heart size={18} /> }
    ];

    const renderEntries = () => {
        if (filter === 'reactions') {
            // Flat map all reactions from all my snaps
            const allReactions = snaps.flatMap(snap => 
                (snap.Reactions || []).map(rxn => ({ ...rxn, snapCaption: snap.caption, snapImage: snap.imageUrl }))
            ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (allReactions.length === 0) {
                return (
                    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', opacity: 0.5 }}>
                        <Heart size={50} style={{ marginBottom: '15px' }} />
                        <p>No one has reacted to your snaps yet.</p>
                    </div>
                );
            }

            return allReactions.map(rxn => (
                <TiltedGlassCard key={rxn.id} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={rxn.snapImage} alt="Snap" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--accent-color)' }}>{rxn.User?.username}</span> reacted with {rxn.emoji}
                        </div>
                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>On your snap: "{rxn.snapCaption || 'No caption'}"</div>
                    </div>
                    <div style={{ fontSize: '0.7em', opacity: 0.4 }}>
                        {new Date(rxn.createdAt).toLocaleDateString()}
                    </div>
                </TiltedGlassCard>
            ));
        }

        const filtered = entries.filter(entry => {
            let typeMatch = true;
            if (filter === 'text') typeMatch = entry.content && entry.content.trim().length > 0;
            else if (filter === 'emoji') typeMatch = !!entry.mood;
            else if (filter !== 'all') typeMatch = getEntryType(entry) === filter;

            const searchMatch = (entry.title?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                              (entry.content?.toLowerCase().includes(searchTerm.toLowerCase()));
            return typeMatch && searchMatch;
        });

        if (filtered.length === 0) {
            return (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', opacity: 0.5 }}>
                    <Smile size={50} style={{ marginBottom: '15px' }} />
                    <p>No entries found here.</p>
                </div>
            );
        }

        return filtered.map(entry => (
            <TiltedGlassCard key={entry.id} style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {entry.photoData && <Camera size={16} color="var(--accent-color)" />}
                        {entry.audioData && <Mic size={16} color="var(--accent-color)" />}
                        {!entry.photoData && !entry.audioData && <Type size={16} color="var(--accent-color)" />}
                        <h4 style={{ margin: 0 }}>{entry.title}</h4>
                    </div>
                    {entry.mood && <span style={{ fontSize: '1.2em' }}>{entry.mood}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8em', opacity: 0.5 }}>
                    <Calendar size={14} />
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                {filter === 'emoji' ? (
                    <div style={{ 
                        fontSize: '4rem', 
                        textAlign: 'center', 
                        padding: '20px', 
                        background: 'rgba(255,255,255,0.02)', 
                        borderRadius: '20px',
                        marginTop: '10px'
                    }}>
                        {entry.mood}
                        <div style={{ fontSize: '0.2em', opacity: 0.5, marginTop: '10px' }}>MOOD LOGGED</div>
                    </div>
                ) : (
                    <p style={{ 
                        color: 'var(--text-primary)', 
                        opacity: 0.8,
                        fontSize: '0.95em', 
                        lineHeight: '1.6',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {entry.content || (entry.photoData ? "Photo Entry" : entry.audioData ? "Audio Entry" : "No Content")}
                    </p>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8em', cursor: 'pointer' }}>
                        {filter === 'emoji' ? 'View Details' : 'Read Detailed'}
                    </button>
                </div>
            </TiltedGlassCard>
        ));
    };

    if (loading) return <div style={{ color: 'var(--text-primary)', padding: '100px', textAlign: 'center' }}>Loading your history...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'var(--glass-bg)', border: 'none', color: 'var(--text-primary)', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ margin: 0 }}>Diary History</h1>
            </div>

            {/* Filters and Search Bar */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '20px', 
                marginBottom: '40px', 
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--glass-bg)',
                padding: '20px',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            style={{
                                background: filter === tab.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                color: filter === tab.id ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9em'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                        type="text" 
                        placeholder="Search your history..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 12px 12px 45px', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Content List */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: filter === 'reactions' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '25px' 
            }}>
                {renderEntries()}
            </div>
        </div>
    );
}
