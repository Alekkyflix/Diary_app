import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSocialLogin = async (provider) => {
        setSocialLoading(provider);
        setError('');
        try {
            const mockSocialId = `social_reg_${Math.random().toString(36).substring(2, 10)}`;
            const res = await api.post('/auth/social-login', { 
                provider, 
                socialId: mockSocialId,
                username: `NewUser_${Math.random().toString(36).substring(2, 5)}`,
                email: `${provider}_new@example.com`
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/');
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(`Registration with ${provider} failed.`);
        } finally {
            setSocialLoading(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) return setError('Please fill in all fields.');
        
        const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!userRegex.test(username.trim())) return setError('Username must be 3-20 characters');
        
        const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
        if (!emailRegex.test(email.trim().toLowerCase())) return setError('Please enter a valid email address');
        
        if (password.length < 6) return setError('Password must be at least 6 characters');

        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/register', { username, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            {showSuccess && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                        <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🎉</h1>
                        <h2 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>You're In!</h2>
                        <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>Welcome to the club. Your secret space is ready.</p>
                        <p style={{ fontSize: '0.9em', opacity: 0.7 }}>Warping to login...</p>
                    </div>
                </div>
            )}
            <TiltedGlassCard style={{ padding: '40px', width: '320px', textAlign: 'center', filter: showSuccess ? 'blur(10px)' : 'none', transition: 'filter 0.5s' }}>
                <h2 style={{ marginBottom: '20px' }}>Create Account</h2>
                {error && <div style={{ color: '#FF5F56', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    <p style={{ fontSize: '0.7em', opacity: 0.5, marginTop: '-10px', marginBottom: '15px' }}>3-20 chars, letters, numbers or underscores.</p>
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            disabled={isLoading} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                position: 'absolute', 
                                right: '15px', 
                                top: '10px', 
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
                    <p style={{ fontSize: '0.7em', opacity: 0.5, marginTop: '-10px', marginBottom: '15px' }}>Minimum 6 characters recommended.</p>
                    <button type="submit" className="btn-primary" style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.8em', opacity: 0.5, marginBottom: '15px' }}>Or join with</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <button type="button" onClick={() => handleSocialLogin('google')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }} disabled={!!socialLoading}>
                            {socialLoading === 'google' ? '...' : <img src="https://www.google.com/favicon.ico" style={{ width: '20px', height: '20px' }} alt="Google" />}
                        </button>
                        <button type="button" onClick={() => handleSocialLogin('github')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }} disabled={!!socialLoading}>
                            {socialLoading === 'github' ? '...' : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>}
                        </button>
                        <button type="button" onClick={() => handleSocialLogin('microsoft')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', opacity: socialLoading ? 0.5 : 1 }} disabled={!!socialLoading}>
                            {socialLoading === 'microsoft' ? '...' : <svg width="20" height="20" viewBox="0 0 23 23"><rect width="10.8" height="10.8" fill="#f25022"/><rect x="12.2" width="10.8" height="10.8" fill="#7fba00"/><rect y="12.2" width="10.8" height="10.8" fill="#00a4ef"/><rect x="12.2" y="12.2" width="10.8" height="10.8" fill="#ffb900"/></svg>}
                        </button>
                    </div>
                </div>
            </TiltedGlassCard>
        </div>
    );
}
