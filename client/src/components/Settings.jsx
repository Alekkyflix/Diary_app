import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Shield, Eye, Palette, Trash2, Save, Key, UserPlus } from 'lucide-react';

import TiltedGlassCard from './TiltedGlassCard';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
    const { theme, setTheme, themes, season, setSeason } = useTheme();
    const [activeTab, setActiveTab] = useState('account');
    const [settings, setSettings] = useState({
        email: '',
        username: '',
        pfpUrl: '',
        gamificationEnabled: true,
        privacy: {
            showMediaToGroups: true,
            showNotesToGroups: false,
            allowActivityTracking: true
        }
    });
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/user/settings');
            setSettings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSettings = async (updatedFields = null) => {
        try {
            const dataToSave = updatedFields || settings;
            await api.put('/user/settings', dataToSave);
            if (!updatedFields) setMessage({ type: 'success', text: 'Settings updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            return setMessage({ type: 'error', text: 'New passwords do not match.' });
        }
        try {
            await api.put('/user/password', {
                currentPassword: passwords.current,
                newPassword: passwords.next
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', next: '', confirm: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you ABSOLUTELY sure? This will delete all your data permanently.")) return;
        try {
            await api.delete('/user');
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete account.' });
        }
    };


    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', color: 'white', position: 'relative', zIndex: 10 }}>
            <h1 style={{ marginBottom: '30px' }}>Settings</h1>

            {message.text && (
                <div style={{ 
                    padding: '15px', 
                    borderRadius: '12px', 
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
                    marginBottom: '20px'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Tabs Sidebar */}
                <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { id: 'account', label: 'Account', icon: <User size={18} /> },
                        { id: 'privacy', label: 'Privacy', icon: <Eye size={18} /> },
                        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
                        { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                            style={{
                                background: activeTab === tab.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <TiltedGlassCard style={{ padding: '30px' }}>
                        
                        {activeTab === 'account' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Account Details</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        {settings.pfpUrl ? (
                                            <img src={settings.pfpUrl} alt="PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>PFP URL</label>
                                        <input 
                                            type="text" 
                                            value={settings.pfpUrl || ''} 
                                            onChange={e => setSettings({...settings, pfpUrl: e.target.value})}
                                            placeholder="https://example.com/photo.jpg"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>Email</label>
                                    <input type="email" value={settings.email} disabled style={{ opacity: 0.5 }} />
                                </div>

                                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="gamify" 
                                        checked={settings.gamificationEnabled} 
                                        onChange={e => setSettings({...settings, gamificationEnabled: e.target.checked})}
                                        style={{ width: 'auto', marginBottom: 0 }}
                                    />
                                    <label htmlFor="gamify">Enable Gamification (Streaks & Badges)</label>
                                </div>

                                <button onClick={handleUpdateSettings} className="btn-primary" style={{ width: '100%' }}>
                                    <Save size={18} style={{ marginRight: 8 }} /> Save Account Changes
                                </button>

                                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button onClick={handleDeleteAccount} style={{ background: 'none', border: '1px solid #FF5F56', color: '#FF5F56', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Trash2 size={18} /> Delete Account Permanently
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Privacy & Sharing</h3>
                                <p style={{ opacity: 0.7, fontSize: '0.9em', marginBottom: '25px' }}>Control who can see your activity and content.</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Share Media to Circles</div>
                                            <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Allow members of your circles to see your Daily Snaps.</div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.privacy.showMediaToGroups} 
                                            onChange={e => setSettings({...settings, privacy: {...settings.privacy, showMediaToGroups: e.target.checked}})}
                                            style={{ width: 'auto', marginBottom: 0 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Share Notes to Circles</div>
                                            <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Let friends read select public diary entries.</div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.privacy.showNotesToGroups} 
                                            onChange={e => setSettings({...settings, privacy: {...settings.privacy, showNotesToGroups: e.target.checked}})}
                                            style={{ width: 'auto', marginBottom: 0 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Activity Tracking</div>
                                            <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Allow system to track usage for better insights.</div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={settings.privacy.allowActivityTracking} 
                                            onChange={e => setSettings({...settings, privacy: {...settings.privacy, allowActivityTracking: e.target.checked}})}
                                            style={{ width: 'auto', marginBottom: 0 }}
                                        />
                                    </div>
                                </div>

                                <button onClick={handleUpdateSettings} className="btn-primary" style={{ width: '100%', marginTop: '30px' }}>
                                    <Save size={18} style={{ marginRight: 8 }} /> Save Privacy Settings
                                </button>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Security</h3>
                                <form onSubmit={handlePasswordChange}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>Current Password</label>
                                        <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>New Password</label>
                                            <input type="password" value={passwords.next} onChange={e => setPasswords({...passwords, next: e.target.value})} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>Confirm New</label>
                                            <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                                        <Key size={18} style={{ marginRight: 8 }} /> Update Password
                                    </button>
                                </form>

                                <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>Two-Step Verification</div>
                                            <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Add an extra layer of security.</div>
                                        </div>
                                        <button disabled style={{ padding: '8px 15px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Manage</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Personalize Theme</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                    {Object.entries(themes).map(([key, t]) => (
                                        <div 
                                            key={key} 
                                            onClick={() => { 
                                                const newSettings = { ...settings, themePreference: key };
                                                setSettings(newSettings);
                                                setTheme(key);
                                                handleUpdateSettings(newSettings);
                                            }}
                                            style={{
                                                padding: '15px',
                                                borderRadius: '15px',
                                                background: t.bg,
                                                border: `3px solid ${theme === key ? t.accent : 'transparent'}`,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.accent, margin: '0 auto 10px' }}></div>
                                            <div style={{ color: t.text, fontSize: '0.8em', fontWeight: 'bold' }}>{t.name}</div>
                                        </div>
                                    ))}
                                </div>

                                <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Seasonal Effects</h3>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {[
                                        { id: 'winter', name: 'Winter / Christmas', icon: '❄️' },
                                        { id: 'summer', name: 'Summer Vibes', icon: '☀️' }
                                    ].map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSeason(s.id)}
                                            style={{
                                                flex: 1,
                                                padding: '20px',
                                                borderRadius: '15px',
                                                background: season === s.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                                            <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </TiltedGlassCard>
                </div>
            </div>
        </div>
    );
}
