import React, { useState, useEffect } from 'react';
import { Camera, Heart, MessageCircle, MapPin, Music, Plus } from 'lucide-react';

import SnapEditor from './SnapEditor';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';

export default function DailySnapsWidget() {
    const [snaps, setSnaps] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSnaps();
    }, []);

    const fetchSnaps = async () => {
        try {
            const res = await api.get('/snaps');
            setSnaps(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch snaps");
        }
    };

    const handleReact = async (snapId, emoji) => {
        try {
            const res = await api.post(`/snaps/${snapId}/react`, { emoji });
            // Ideally socket.io would handle this, but for now we re-fetch or update local state
            fetchSnaps(); // Refresh to see reaction
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ marginBottom: '40px' }}>
            {showEditor && (
                <SnapEditor
                    onClose={() => setShowEditor(false)}
                    onPosted={() => { setShowEditor(false); fetchSnaps(); }}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Daily Snaps 📸</h3>
            </div>

            <div style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                paddingBottom: '20px',
                scrollbarWidth: 'none' // Hide scrollbar for cleaner look
            }}>
                {/* Add Button Card */}
                <div
                    onClick={() => setShowEditor(true)}
                    style={{
                        flex: '0 0 150px', height: '250px',
                        borderRadius: '20px',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ background: 'var(--accent-color)', borderRadius: '50%', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <Plus size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Add Snap</span>
                </div>

                {/* Snap Feed */}
                {snaps.map(snap => (
                    <div key={snap.id} style={{ flex: '0 0 180px', position: 'relative' }}>
                        <div style={{
                            height: '250px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'black',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}>
                            <img src={snap.imageUrl} alt="Snap" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* Overlays */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>{snap.User.username}</div>
                                <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>

                        {/* Reaction Bar */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '5px',
                            marginTop: '-15px', position: 'relative', zIndex: 5
                        }}>
                            <button onClick={() => handleReaction(snap.id, '❤️')} style={{ border: 'none', background: 'white', borderRadius: '50%', width: 30, height: 30, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer' }}>❤️</button>
                            <button onClick={() => handleReaction(snap.id, '🔥')} style={{ border: 'none', background: 'white', borderRadius: '50%', width: 30, height: 30, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', cursor: 'pointer' }}>🔥</button>
                            {/* Only showing 2 for space, but user can add more logic later */}
                        </div>

                        {/* Reaction Counts */}
                        {snap.Reactions?.length > 0 && (
                            <div style={{ textAlign: 'center', fontSize: '0.7em', marginTop: '5px', opacity: 0.6 }}>
                                {snap.Reactions.length} reactions
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
