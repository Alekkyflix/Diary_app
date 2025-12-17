import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Smile, Bed, Phone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';

export default function Dashboard() {
    const [entries, setEntries] = useState([]);
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/entries', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEntries(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
        fetchEntries();
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Welcome back, <span style={{ color: 'var(--accent-color)' }}>{user.username}</span></h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Here is your daily snapshot.</p>
                </div>
                <Link to="/add" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> New Entry
                </Link>
            </div>

            {/* Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <TiltedGlassCard style={{ padding: '20px', textAlign: 'center' }}>
                    <Smile size={32} color="var(--accent-color)" />
                    <h3>Mood</h3>
                    <p>Feeling Great</p>
                </TiltedGlassCard>
                <TiltedGlassCard style={{ padding: '20px', textAlign: 'center' }}>
                    <Bed size={32} color="var(--accent-color)" />
                    <h3>Sleep</h3>
                    <p>7h 30m</p>
                </TiltedGlassCard>
                <TiltedGlassCard style={{ padding: '20px', textAlign: 'center', borderColor: '#FF5F56' }}>
                    <Phone size={32} color="#FF5F56" />
                    <h3>Helpline</h3>
                    <p style={{ fontSize: '0.8em' }}>1190 (Kenyan Red Cross)</p>
                </TiltedGlassCard>
            </div>

            <h3>Recent Entries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {entries.length === 0 ? (
                    <p style={{ color: 'gray' }}>No entries yet.</p>
                ) : (
                    entries.map(entry => (
                        <TiltedGlassCard key={entry.id} style={{ padding: '20px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                                <span style={{ color: 'gray', fontSize: '0.9em' }}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: 'gray', marginTop: '10px', height: '1.5em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {entry.content}
                            </p>
                        </TiltedGlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
