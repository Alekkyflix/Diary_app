import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Key, Mail, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';

export default function Login() {
    const [step, setStep] = useState(1); // 1: Username, 2: Password
    const [idInput, setIdInput] = useState(''); // email/username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState(''); // Display name from backend
    const [socialLoading, setSocialLoading] = useState(null); // 'google', 'github', 'microsoft'
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSocialLogin = async (provider) => {
        setSocialLoading(provider);
        setError('');
        try {
            const mockSocialId = `social_${Math.random().toString(36).substring(2, 10)}`;
            const res = await api.post('/auth/social-login', { 
                provider, 
                socialId: mockSocialId,
                username: `SocialUser_${Math.random().toString(36).substring(2, 5)}`,
                email: `${provider}_user@example.com`
            });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(`Social login with ${provider} failed. Please try again.`);
        } finally {
            setSocialLoading(null);
        }
    };

    const handleStepOne = async (e) => {
        e.preventDefault();
        let input = idInput.trim();
        if (!input) return setError('Please enter your username or email');
        
        if (input.includes('@')) {
            input = input.toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) return setError('Please enter a valid email address');
        } else {
            const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!userRegex.test(input)) return setError('Username must be 3-20 characters');
        }

        setIdInput(input);
        setIsLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/check-user', { username: input });
            setVerifiedUser(res.data.username);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Identity verification failed.');
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
            const res = await api.post('/auth/login', { username: idInput, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
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
                            <p style={{ fontSize: '0.7em', opacity: 0.5, marginTop: '-10px', marginBottom: '15px' }}>
                                Enter your username or registered email.
                            </p>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Next'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => { setStep(1); setPassword(''); setError(''); }}
                            style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'white', opacity: 0.6 }}
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
                                    type={showPassword ? "text" : "password"} placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ textAlign: 'center', fontSize: '1.1em' }}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ 
                                        position: 'absolute', 
                                        right: '15px', 
                                        top: '12px', 
                                        background: 'none', 
                                        border: 'none', 
                                        color: 'white', 
                                        opacity: 0.4,
                                        cursor: 'pointer',
                                        padding: '5px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isLoading}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                        
                        <div style={{ marginTop: '20px' }}>
                            <Link to="/forgot-password" style={{ color: '#FF2E63', fontWeight: 'bold', fontSize: '0.8em', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.8em', opacity: 0.5, marginBottom: '15px' }}>Or continue with</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button 
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }}
                            disabled={!!socialLoading}
                        >
                            {socialLoading === 'google' ? '...' : <img src="https://www.google.com/favicon.ico" style={{ width: '20px', height: '20px' }} alt="Google" />}
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleSocialLogin('github')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }}
                            disabled={!!socialLoading}
                        >
                            {socialLoading === 'github' ? '...' : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>}
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleSocialLogin('microsoft')}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }}
                            disabled={!!socialLoading}
                        >
                            {socialLoading === 'microsoft' ? '...' : <svg width="20" height="20" viewBox="0 0 23 23"><rect width="10.8" height="10.8" fill="#f25022"/><rect x="12.2" width="10.8" height="10.8" fill="#7fba00"/><rect y="12.2" width="10.8" height="10.8" fill="#00a4ef"/><rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#ffb900"/></svg>}
                        </button>
                    </div>
                </div>
            </TiltedGlassCard>
        </div>
    );
}
