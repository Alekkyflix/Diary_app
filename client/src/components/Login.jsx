import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Key, Mail, CheckCircle2 } from 'lucide-react';

import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';

export default function Login() {
    const [step, setStep] = useState(1); // 1: Username, 2: Password
    const [idInput, setIdInput] = useState(''); // email/username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState(''); // Display name from backend
    const navigate = useNavigate();

    const handleStepOne = async (e) => {
        e.preventDefault();
        if (!idInput) return setError('Please enter your username or email');
        
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/check-user', { username: idInput });
            setVerifiedUser(res.data.username);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Account not found. Please try again or register.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!password) return setError('Password is required');

        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email: idInput, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.themePreference) {
                localStorage.setItem('theme', res.data.user.themePreference);
            }
            if (res.data.user.pfpUrl) {
                localStorage.setItem('pfpUrl', res.data.user.pfpUrl);
            }
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            <TiltedGlassCard style={{ padding: '40px', width: '360px', textAlign: 'center' }}>
                
                {step === 1 ? (
                    <>
                        <div style={{ background: 'var(--accent-color)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Mail color="white" size={30} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Welcome Back</h2>
                        <p style={{ opacity: 0.6, fontSize: '0.9em', marginBottom: '30px' }}>Enter your identity to proceed</p>
                        
                        {error && <div style={{ color: '#FF5F56', background: 'rgba(255, 95, 86, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9em' }}>{error}</div>}
                        
                        <form onSubmit={handleStepOne}>
                            <input
                                type="text" placeholder="Username or Email"
                                value={idInput}
                                onChange={(e) => setIdInput(e.target.value)}
                                style={{ textAlign: 'center', fontSize: '1.1em' }}
                                autoFocus
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Next'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => { setStep(1); setPassword(''); setError(''); }}
                            style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.6 }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#10B981', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1a1a1a' }}>
                                    <CheckCircle2 color="white" size={12} />
                                </div>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{verifiedUser}</div>
                                <div style={{ fontSize: '0.7em', opacity: 0.5 }}>Identity Verified</div>
                            </div>
                        </div>

                        {error && <div style={{ color: '#FF5F56', background: 'rgba(255, 95, 86, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9em' }}>{error}</div>}
                        
                        <form onSubmit={handleLogin}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password" placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ textAlign: 'center', fontSize: '1.1em' }}
                                    autoFocus
                                />
                                <Key size={18} style={{ position: 'absolute', right: '15px', top: '15px', opacity: 0.3 }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '20px' }}>
                            <Link
                                to="/forgot-password"
                                style={{ color: '#FF2E63', fontWeight: 'bold', fontSize: '0.8em', textDecoration: 'none' }}
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </>
                )}

                <p style={{ marginTop: '30px', fontSize: '0.9em', opacity: 0.7 }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Sign Up</Link>
                </p>
            </TiltedGlassCard>
        </div>
    );
}

