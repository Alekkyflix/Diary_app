import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { User, Shield, Eye, EyeOff, Palette, Trash2, Save, Key, Camera, Upload, X, Clock, Lock } from 'lucide-react';

import TiltedGlassCard from './TiltedGlassCard';
import { useTheme } from '../contexts/ThemeContext';
import CustomAlert from './CustomAlert';

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
    const [showCamera, setShowCamera] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', mode: 'alert', onConfirm: null });
    
    // Security states
    const [securityModal, setSecurityModal] = useState(null); // 'verify', 'update', 'app-lock'
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false, pin: false });
    const [lastLogin, setLastLogin] = useState(null);
    const [pin, setPin] = useState('');

    const videoRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSettings();
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const res = await api.get('/user/activity');
            setLastLogin(res.data.lastLogin);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/user/settings');
            setSettings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerifyPassword = async (e) => {
        e.preventDefault();
        try {
            await api.post('/user/verify-password', { password: passwordData.current });
            setSecurityModal('update');
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Verification Failed',
                message: 'Incorrect current password. Please try again.'
            });
        }
    };

    const handleFinalUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.next !== passwordData.confirm) {
            return triggerAlert({
                type: 'error',
                title: 'Match Error',
                message: 'New passwords do not match.'
            });
        }
        try {
            await api.put('/user/password', {
                currentPassword: passwordData.current,
                newPassword: passwordData.next
            });
            triggerAlert({
                type: 'success',
                title: 'Password Updated',
                message: 'Your password has been changed successfully.'
            });
            setSecurityModal(null);
            setPasswordData({ current: '', next: '', confirm: '' });
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Update Failed',
                message: err.response?.data?.error || 'Failed to change password.'
            });
        }
    };

    const handleUpdateAppLock = async (e) => {
        e.preventDefault();
        try {
            await api.post('/user/app-lock', { pin });
            triggerAlert({
                type: 'success',
                title: 'App Lock Updated',
                message: pin ? 'Your security PIN has been set successfully.' : 'App Lock has been disabled.'
            });
            setSecurityModal(null);
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Setup Failed',
                message: 'Could not update App Lock pin.'
            });
        }
    };

    const triggerAlert = (config) => {
        setAlertConfig({ ...alertConfig, isOpen: true, ...config });
    };

    const compressImage = (base64Str, maxWidth = 200, maxHeight = 200) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality factor
            };
        });
    };

    const handleUpdateSettings = async (updatedFields = null) => {
        try {
            const dataToSave = updatedFields || settings;
            const res = await api.put('/user/settings', dataToSave);
            
            // Sync local storage so other components (like Dashboard) update immediately
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...res.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            if (!updatedFields) {
                triggerAlert({
                    type: 'success',
                    title: 'Settings Saved',
                    message: 'Your account settings have been updated successfully.'
                });
            }
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update settings. Please try again.'
            });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            return triggerAlert({
                type: 'error',
                title: 'Match Error',
                message: 'New passwords do not match.'
            });
        }
        try {
            await api.put('/user/password', {
                currentPassword: passwords.current,
                newPassword: passwords.next
            });
            triggerAlert({
                type: 'success',
                title: 'Password Updated',
                message: 'Your password has been changed successfully.'
            });
            setPasswords({ current: '', next: '', confirm: '' });
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Update Failed',
                message: err.response?.data?.error || 'Failed to change password.'
            });
        }
    };

    const handleDeleteAccount = async () => {
        triggerAlert({
            type: 'warning',
            title: 'Delete Account?',
            message: 'Are you ABSOLUTELY sure? This will delete all your data permanently and cannot be undone.',
            mode: 'confirm',
            onConfirm: async () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await api.delete('/user');
                    localStorage.clear();
                    window.location.href = '/login';
                } catch (err) {
                    triggerAlert({
                        type: 'error',
                        title: 'Deletion Failed',
                        message: 'Failed to delete account. Please contact support if this persists.'
                    });
                }
            }
        });
    };


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                return triggerAlert({
                    type: 'error',
                    title: 'Invalid File',
                    message: 'Please upload a valid image file.'
                });
            }
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressImage(reader.result);
                setSettings({ ...settings, pfpUrl: compressed });
                triggerAlert({
                    type: 'success',
                    title: 'Image Loaded',
                    message: 'Your new profile picture has been loaded. Don\'t forget to save changes!'
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            triggerAlert({
                type: 'error',
                title: 'Camera Access Denied',
                message: 'Could not access your camera. Please check your browser permissions.'
            });
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const capturePhoto = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUri = canvas.toDataURL('image/jpeg');
        const compressed = await compressImage(dataUri);
        setSettings({ ...settings, pfpUrl: compressed });
        stopCamera();
        triggerAlert({
            type: 'success',
            title: 'Photo Captured',
            message: 'Your photo has been set as your new profile picture. Remember to save account changes!'
        });
    };

    const validatePfpUrl = (url) => {
        if (!url) return true;
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const lowerUrl = url.toLowerCase();
        if (videoExtensions.some(ext => lowerUrl.endsWith(ext))) {
            triggerAlert({
                type: 'error',
                title: 'Invalid URL',
                message: 'Profile pictures must be static images. Video links are not allowed.'
            });
            return false;
        }
        return true;
    };

    const handleUpdateSettingsWithValidation = async (updatedFields = null) => {
        const data = updatedFields || settings;
        if (!validatePfpUrl(data.pfpUrl)) return;
        handleUpdateSettings(data);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)', position: 'relative', zIndex: 10 }}>
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
                                background: activeTab === tab.id ? 'var(--accent-color)' : 'var(--glass-bg)',
                                color: activeTab === tab.id ? 'var(--btn-text)' : 'var(--text-primary)',
                                border: activeTab === tab.id ? 'none' : '1px solid var(--glass-border)',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                cursor: 'pointer'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}

                    <Link
                        to="/history"
                        style={{
                            background: 'var(--glass-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            marginTop: '20px'
                        }}
                    >
                        <Clock size={18} color="var(--accent-color)" /> Diary History
                    </Link>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <TiltedGlassCard style={{ padding: '30px' }}>
                        
                        {showCamera && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: '#1F2937', padding: '20px', borderRadius: '20px', position: 'relative', maxWidth: '90%' }}>
                                    <button onClick={stopCamera} style={{ position: 'absolute', top: -15, right: -15, background: 'var(--accent-color)', border: 'none', color: 'var(--btn-text)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} />
                                    </button>
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', background: '#000' }} />
                                    <button onClick={capturePhoto} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                                        Capture Frame
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Account Details</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                        {settings.pfpUrl ? (
                                            <img src={settings.pfpUrl} alt="PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.8em', opacity: 0.7, marginBottom: '5px' }}>Profile Picture</label>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            <button 
                                                onClick={() => fileInputRef.current.click()} 
                                                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Upload size={16} /> Upload
                                            </button>
                                            <button 
                                                onClick={startCamera} 
                                                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Camera size={16} /> Capture
                                            </button>
                                            <input 
                                                type="text" 
                                                value={settings.pfpUrl?.startsWith('data:') ? 'Local Image (Compressed)' : (settings.pfpUrl || '')} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (!val.startsWith('Local Image')) {
                                                        setSettings({...settings, pfpUrl: val});
                                                    }
                                                }}
                                                placeholder="Or paste URL (no videos)"
                                                style={{ flex: 1, minWidth: '200px', margin: 0, color: settings.pfpUrl?.startsWith('data:') ? 'var(--accent-color)' : 'var(--text-primary)' }}
                                                readOnly={settings.pfpUrl?.startsWith('data:')}
                                            />
                                            {settings.pfpUrl?.startsWith('data:') && (
                                                <button 
                                                    onClick={() => setSettings({...settings, pfpUrl: ''})}
                                                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: 'white', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    Clear
                                                </button>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                onChange={handleFileUpload} 
                                                accept="image/*" 
                                            />
                                        </div>
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

                                <button onClick={() => handleUpdateSettingsWithValidation()} className="btn-primary" style={{ width: '100%' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h3 style={{ marginBottom: '5px' }}>Security & Authorization</h3>
                                
                                {/* Last Login Widget */}
                                <div style={{ 
                                    padding: '20px', 
                                    background: 'var(--glass-bg)', 
                                    borderRadius: '16px', 
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        borderRadius: '12px', 
                                        background: 'rgba(var(--accent-color-rgb), 0.2)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>
                                        <Clock size={24} color="var(--accent-color)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Last Login Activity</div>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {lastLogin ? new Date(lastLogin).toLocaleString() : 'First time login'}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Update Card */}
                                <div style={{ 
                                    padding: '20px', 
                                    background: 'var(--glass-bg)', 
                                    borderRadius: '16px', 
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Account Password</div>
                                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Change your password to keep your account safe.</div>
                                    </div>
                                    <button 
                                        onClick={() => setSecurityModal('verify')}
                                        className="btn-primary" 
                                        style={{ padding: '10px 20px', fontSize: '0.9em' }}
                                    >
                                        Update Password
                                    </button>
                                </div>

                                {/* App Lock Card */}
                                <div style={{ 
                                    padding: '20px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Internal App Lock</div>
                                        <div style={{ fontSize: '0.8em', opacity: 0.6 }}>Set a PIN to lock the diary when not in use.</div>
                                    </div>
                                    <button 
                                        onClick={() => setSecurityModal('app-lock')}
                                        style={{ 
                                            background: 'var(--glass-bg)', 
                                            border: '1px solid var(--glass-border)', 
                                            color: 'var(--text-primary)', 
                                            padding: '10px 20px', 
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Lock size={16} /> Configure PIN
                                    </button>
                                </div>

                                {/* 2FA Placeholder (Restyled) */}
                                <div style={{ 
                                    padding: '20px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '16px', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: 0.6
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Two-Step Verification</div>
                                        <div style={{ fontSize: '0.8em' }}>Coming soon: Mobile or email verification.</div>
                                    </div>
                                    <Shield size={20} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div>
                                <h3 style={{ marginBottom: '20px' }}>Personalize Theme</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                    {Object.entries(themes).map(([key, t]) => (
                                        <button 
                                            key={key} 
                                            type="button"
                                            onMouseDown={() => { 
                                                console.log("Theme mousedown:", key);
                                                setTheme(key); 
                                            }}
                                            onClick={() => { 
                                                console.log("Theme clicked:", key);
                                                const newSettings = { ...settings, themePreference: key };
                                                setSettings(newSettings);
                                                setTheme(key);
                                                handleUpdateSettings(newSettings);
                                            }}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '20px',
                                                background: t.bg,
                                                border: `3px solid ${theme === key ? t.accent : 'var(--glass-border)'}`,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s',
                                                display: 'block',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                position: 'relative',
                                                zIndex: 100,
                                                pointerEvents: 'auto'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            aria-label={`Select ${t.name} theme`}
                                        >
                                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: t.accent, margin: '0 auto 15px', pointerEvents: 'none', boxShadow: `0 0 20px ${t.accent}44` }}></div>
                                            <div style={{ color: t.text, fontSize: '0.9em', fontWeight: 'bold', pointerEvents: 'none' }}>{t.name}</div>
                                        </button>
                                    ))}
                                </div>

                                <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Seasonal Effects</h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'winter', label: 'Winter / Christmas', icon: '❄️' },
                                        { id: 'summer', label: 'Summer', icon: '☀️' },
                                        { id: 'spring', label: 'Spring', icon: '🌱' },
                                        { id: 'autumn', label: 'Autumn', icon: '🍁' }
                                    ].map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => setSeason(s.id)} 
                                            style={{ 
                                                flex: 1,
                                                minWidth: '120px',
                                                background: season === s.id ? 'var(--accent-color)' : 'var(--glass-bg)', 
                                                border: season === s.id ? 'none' : '1px solid var(--glass-border)', 
                                                color: season === s.id ? 'var(--btn-text)' : 'var(--text-primary)', 
                                                padding: '15px', 
                                                borderRadius: '12px', 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                                            <span>{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </TiltedGlassCard>
                </div>
            </div>
            {securityModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <TiltedGlassCard style={{ maxWidth: '450px', width: '100%', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>
                                {securityModal === 'verify' && 'Verify Identity'}
                                {securityModal === 'update' && 'Set New Password'}
                                {securityModal === 'app-lock' && 'App Lock PIN'}
                            </h3>
                            <button onClick={() => setSecurityModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {securityModal === 'verify' && (
                            <form onSubmit={handleVerifyPassword}>
                                <p style={{ fontSize: '0.9em', opacity: 0.7, marginBottom: '20px' }}>Please enter your current password to proceed with sensitive changes.</p>
                                <div style={{ position: 'relative', marginBottom: '20px' }}>
                                    <input 
                                        type={showPasswords.current ? 'text' : 'password'} 
                                        placeholder="Current Password" 
                                        value={passwordData.current}
                                        onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                        required 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'gray', cursor: 'pointer', zIndex: 10 }}
                                    >
                                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Continue</button>
                            </form>
                        )}

                        {securityModal === 'update' && (
                            <form onSubmit={handleFinalUpdatePassword}>
                                <p style={{ fontSize: '0.9em', opacity: 0.7, marginBottom: '20px' }}>Choose a strong new password for your account.</p>
                                
                                <div style={{ position: 'relative', marginBottom: '15px' }}>
                                    <input 
                                        type={showPasswords.next ? 'text' : 'password'} 
                                        placeholder="New Password" 
                                        value={passwordData.next}
                                        onChange={e => setPasswordData({...passwordData, next: e.target.value})}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                        required 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords({...showPasswords, next: !showPasswords.next})}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'gray', cursor: 'pointer', zIndex: 10 }}
                                    >
                                        {showPasswords.next ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div style={{ position: 'relative', marginBottom: '25px' }}>
                                    <input 
                                        type={showPasswords.confirm ? 'text' : 'password'} 
                                        placeholder="Confirm New Password" 
                                        value={passwordData.confirm}
                                        onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                                        style={{ width: '100%', paddingRight: '45px' }}
                                        required 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'gray', cursor: 'pointer', zIndex: 10 }}
                                    >
                                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Password</button>
                            </form>
                        )}

                        {securityModal === 'app-lock' && (
                            <form onSubmit={handleUpdateAppLock}>
                                <p style={{ fontSize: '0.9em', opacity: 0.7, marginBottom: '20px' }}>Set a 4-digit PIN to lock the app. Leave empty to disable.</p>
                                <div style={{ position: 'relative', marginBottom: '25px' }}>
                                    <input 
                                        type={showPasswords.pin ? 'text' : 'password'} 
                                        placeholder="Enter PIN" 
                                        maxLength={4}
                                        value={pin}
                                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                        style={{ width: '100%', paddingRight: '45px', textAlign: 'center', fontSize: '1.5em', letterSpacing: '0.5em' }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswords({...showPasswords, pin: !showPasswords.pin})}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'gray', cursor: 'pointer', zIndex: 10 }}
                                    >
                                        {showPasswords.pin ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>{pin ? 'Enable App Lock' : 'Disable App Lock'}</button>
                            </form>
                        )}
                    </TiltedGlassCard>
                </div>
            )}

            <CustomAlert 
                {...alertConfig} 
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} 
            />
        </div>
    );
}
