import React, { useEffect, useState } from 'react';
import { Smile, Bed, Phone, Plus, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';
import GamificationWidget from './GamificationWidget';
import DailySnapsWidget from './DailySnapsWidget';
import api from '../api';


export default function Dashboard() {
    const [entries, setEntries] = useState([]);
    const [gamification, setGamification] = useState({ currentStreak: 0, badges: [] });
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entriesRes, gameRes] = await Promise.all([
                    api.get('/entries'),
                    api.get('/user/gamification')
                ]);

                setEntries(entriesRes.data);
                setGamification(gameRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        fetchData();
    }, []);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {user.pfpUrl ? (
                        <img 
                            src={user.pfpUrl} 
                            alt="Profile" 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                border: '3px solid var(--accent-color)',
                                objectFit: 'cover'
                            }} 
                        />
                    ) : (
                        <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%', 
                            background: 'rgba(255,255,255,0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <Smile size={30} color="var(--accent-color)" />
                        </div>
                    )}
                    <div>
                        <h2>Welcome back, <span style={{ color: 'var(--accent-color)' }}>{user.username}</span></h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Here is your daily snapshot.</p>
                    </div>
                </div>
                <Link to="/add" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <Plus size={18} /> New Entry
                </Link>
            </div>

            {/* Daily Snaps Feed (New Feature) */}
            <DailySnapsWidget />

            {/* Quick Stats & Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <GamificationWidget streak={gamification.currentStreak} badges={gamification.badges} />

                <TiltedGlassCard style={{ padding: '20px', textAlign: 'center' }}>
                    <div title="Current Mood">
                        <Smile size={32} color="var(--accent-color)" />
                        <h4 style={{ margin: '10px 0 5px' }}>Mood</h4>
                        <p style={{ fontSize: '1.2em' }}>{entries[0]?.mood || '—'}</p>
                    </div>
                </TiltedGlassCard>

                <Link to="/meditate" style={{ display: 'contents' }}>
                    <TiltedGlassCard style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                        <Bed size={32} color="var(--accent-color)" />
                        <h4 style={{ margin: '10px 0 5px' }}>Breathe</h4>
                        <p style={{ fontSize: '0.8em', opacity: 0.6 }}>Focus Session</p>
                    </TiltedGlassCard>
                </Link>

                <Link to="/social" style={{ display: 'contents' }}>
                    <TiltedGlassCard style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                        <Share2 size={32} color="var(--accent-color)" />
                        <h4 style={{ margin: '10px 0 5px' }}>Circles</h4>
                        <p style={{ fontSize: '0.8em', opacity: 0.6 }}>Your Tribe</p>
                    </TiltedGlassCard>
                </Link>

                <Link to="/support" style={{ display: 'contents' }}>
                    <TiltedGlassCard style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                        <Phone size={32} color="#FF5F56" />
                        <h4 style={{ margin: '10px 0 5px' }}>Helpline</h4>
                        <p style={{ fontSize: '0.8em', color: '#FF5F56' }}>Emergency</p>
                    </TiltedGlassCard>
                </Link>
            </div>


            {/* Recent Entries */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Recent Entries</h3>
                {entries.length > 0 && (
                    <Link to="/settings" style={{ fontSize: '0.9em', color: 'var(--accent-color)', textDecoration: 'none' }}>
                        View Full History
                    </Link>
                )}
            </div>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
            }}>
                {entries
                    .filter(entry => !entry.audioData && !entry.photoData)
                    .slice(0, 10)
                    .length === 0 ? (
                    <p style={{ color: 'gray', gridColumn: '1/-1' }}>No recent text entries.</p>
                ) : (
                    entries
                        .filter(entry => !entry.audioData && !entry.photoData)
                        .slice(0, 10)
                        .map(entry => (
                            <TiltedGlassCard key={entry.id} style={{ padding: '20px', cursor: 'pointer', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{entry.title}</span>
                                    {entry.mood && <span style={{ fontSize: '1.5em' }}>{entry.mood}</span>}
                                </div>
                                <span style={{ color: 'gray', fontSize: '0.8em', display: 'block', marginBottom: '10px' }}>
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                                <p style={{
                                    color: 'rgba(255,255,255,0.7)',
                                    lineHeight: '1.5',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {entry.content}
                                </p>
                            </TiltedGlassCard>
                        ))
                )}
            </div>
        </div>
    );
}
