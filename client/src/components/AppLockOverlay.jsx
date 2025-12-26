import React, { useState, useEffect } from 'react';
import api from '../api';
import TiltedGlassCard from './TiltedGlassCard';
import { Lock, X, CheckCircle2 } from 'lucide-react';

export default function AppLockOverlay({ onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLock();
    }, []);

    const checkLock = async () => {
        try {
            const res = await api.post('/user/verify-app-lock', { pin: '' });
            if (res.data.skip) {
                setIsEnabled(false);
                onUnlock?.();
            } else {
                setIsEnabled(true);
            }
        } catch (err) {
            console.error("Lock check failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e?.preventDefault();
        if (pin.length < 4) return;

        try {
            const res = await api.post('/user/verify-app-lock', { pin });
            if (res.data.isValid) {
                onUnlock?.();
                setIsEnabled(false);
            } else {
                setError(true);
                setPin('');
                setTimeout(() => setError(false), 500);
            }
        } catch (err) {
            console.error("Verification failed", err);
        }
    };

    const handleKeypad = (val) => {
        if (pin.length < 4) {
            const newPin = pin + val;
            setPin(newPin);
            if (newPin.length === 4) {
                // Auto verify on 4th digit
                setTimeout(() => verifyAuto(newPin), 200);
            }
        }
    };

    const verifyAuto = async (p) => {
        try {
            const res = await api.post('/user/verify-app-lock', { pin: p });
            if (res.data.isValid) {
                onUnlock?.();
                setIsEnabled(false);
            } else {
                setError(true);
                setPin('');
                setTimeout(() => setError(false), 500);
            }
        } catch (err) {}
    };

    if (loading || !isEnabled) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(15px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <TiltedGlassCard style={{
                maxWidth: '400px',
                width: '100%',
                padding: '40px',
                textAlign: 'center',
                animation: error ? 'shake 0.3s ease-in-out' : 'none'
            }}>
                <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: 'rgba(var(--accent-color-rgb), 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <Lock size={30} color="var(--accent-color)" />
                </div>

                <h2 style={{ marginBottom: '10px' }}>App Locked</h2>
                <p style={{ opacity: 0.6, fontSize: '0.9em', marginBottom: '30px' }}>Enter your security PIN to access the diary.</p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px' }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: pin.length > i ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.2s'
                        }} />
                    ))}
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '15px',
                    maxWidth: '250px',
                    margin: '0 auto' 
                }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button key={n} onClick={() => handleKeypad(n.toString())} style={keypadStyle}>{n}</button>
                    ))}
                    <button onClick={() => setPin('')} style={keypadStyle}><X size={20} /></button>
                    <button onClick={() => handleKeypad('0')} style={keypadStyle}>0</button>
                    <button onClick={handleVerify} style={keypadStyle}><CheckCircle2 size={20} /></button>
                </div>

                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }
                `}</style>
            </TiltedGlassCard>
        </div>
    );
}

const keypadStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    padding: '15px',
    borderRadius: '16px',
    fontSize: '1.2em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};
