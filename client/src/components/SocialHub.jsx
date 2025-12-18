import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users, UserPlus, ArrowLeft } from 'lucide-react';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';



export default function SocialHub() {
    const [groups, setGroups] = useState([]);
    const [view, setView] = useState('list'); // 'list', 'create', 'join'
    const [formData, setFormData] = useState({ name: '', description: '', inviteCode: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (err) {
            console.error("Failed to fetch groups");
        }
    };


    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups',
                { name: formData.name, description: formData.description }
            );
            setView('list');
            fetchGroups();
        } catch (err) {
            setError('Failed to create group');
        }
    };


    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups/join',
                { inviteCode: formData.inviteCode }
            );
            setView('list');
            fetchGroups();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to join group');
        }
    };


    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: 'white', position: 'relative', zIndex: 10 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Users size={40} color="var(--accent-color)" /> Social Hub
                    </h1>
                    <p style={{ opacity: 0.7 }}>Connect with your inner circle.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-primary" onClick={() => setView('create')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New Circle
                    </button>
                    <button className="btn-secondary" onClick={() => setView('join')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserPlus size={18} /> Join via Code
                    </button>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                </div>
            </div>


            {/* Create View */}
            {view === 'create' && (
                <TiltedGlassCard style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h2>Create a Circle</h2>
                    <form onSubmit={handleCreate} style={{ marginTop: '20px' }}>
                        <input
                            type="text" placeholder="Group Name (e.g. Besties)"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <textarea
                            placeholder="Description (Optional)" rows="3"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '15px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
                            <button type="button" onClick={() => setView('list')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </TiltedGlassCard>
            )}

            {/* Join View */}
            {view === 'join' && (
                <TiltedGlassCard style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <h2>Join a Circle</h2>
                    {error && <p style={{ color: '#FF2E63' }}>{error}</p>}
                    <form onSubmit={handleJoin} style={{ marginTop: '20px' }}>
                        <input
                            type="text" placeholder="Enter Invite Code"
                            value={formData.inviteCode} onChange={e => setFormData({ ...formData, inviteCode: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Join</button>
                            <button type="button" onClick={() => setView('list')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                </TiltedGlassCard>
            )}

            {/* List View */}
            {view === 'list' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                    {groups.map(group => (
                        <TiltedGlassCard key={group.id} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate(`/groups/${group.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{group.name}</h3>
                                <span style={{ fontSize: '2rem' }}>👥</span>
                            </div>
                            <p style={{ opacity: 0.7, marginBottom: '20px' }}>{group.description || 'No description'}</p>
                            <div style={{ fontSize: '0.8em', opacity: 0.5 }}>Created by You implicitly (mock)</div>
                        </TiltedGlassCard>
                    ))}
                    {groups.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, padding: '50px' }}>
                            You aren't in any circles yet. Create one or join with a code!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
