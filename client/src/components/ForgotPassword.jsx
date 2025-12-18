import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';
import { Send, Key, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPass, setNewPass] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Token + New Pass, 3: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendToken = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send token');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email, token, newPassword: newPass });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            <TiltedGlassCard style={{ padding: '40px', width: '350px', textAlign: 'center' }}>
                {step === 1 && (
                    <>
                        <h2 style={{ marginBottom: '10px' }}>Recovery</h2>
                        <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '0.9em' }}>
                            Enter your email to receive a reset token.
                        </p>
                        {error && <p style={{ color: '#FF5F56' }}>{error}</p>}
                        <form onSubmit={handleSendToken}>
                            <input
                                type="email" placeholder="email@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? 'Sending...' : <><Send size={18} style={{ marginRight: 8 }} /> Send Token</>}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 style={{ marginBottom: '10px' }}>Reset</h2>
                        <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '0.9em' }}>
                            Enter the token and your new password.
                        </p>
                        {error && <p style={{ color: '#FF5F56' }}>{error}</p>}
                        <form onSubmit={handleReset}>
                            <input
                                type="text" placeholder="Recovery Token (8 digits)"
                                value={token} onChange={(e) => setToken(e.target.value)}
                                required
                            />
                            <input
                                type="password" placeholder="New Password"
                                value={newPass} onChange={(e) => setNewPass(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? 'Updating...' : <><Key size={18} style={{ marginRight: 8 }} /> Reset Password</>}
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                        <h2 style={{ marginBottom: '10px' }}>All set!</h2>
                        <p style={{ opacity: 0.8, marginBottom: '20px' }}>Your password has been reset.</p>
                        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
                            Back to Login
                        </button>
                    </>
                )}

                {step !== 3 && (
                    <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                        <Link to="/login">Back to Login</Link>
                    </p>
                )}
            </TiltedGlassCard>
        </div>
    );
}

