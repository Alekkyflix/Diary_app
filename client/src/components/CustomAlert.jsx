import React from 'react';
import TiltedGlassCard from './TiltedGlassCard';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function CustomAlert({ 
    isOpen, 
    type = 'info', // 'info', 'success', 'warning', 'error'
    title, 
    message, 
    onClose, 
    onConfirm, 
    mode = 'alert' // 'alert' or 'confirm'
}) {
    if (!isOpen) return null;

    const icons = {
        info: <Info size={32} color="var(--accent-color)" />,
        success: <CheckCircle2 size={32} color="#10B981" />,
        warning: <AlertCircle size={32} color="#F59E0B" />,
        error: <XCircle size={32} color="#EF4444" />
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <TiltedGlassCard style={{
                maxWidth: '400px',
                width: '100%',
                padding: '30px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                }}>
                    {icons[type]}
                </div>

                {title && <h3 style={{ margin: 0, color: 'white', fontSize: '1.4em' }}>{title}</h3>}
                
                <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '1em',
                    lineHeight: '1.5'
                }}>
                    {message}
                </p>

                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    width: '100%', 
                    marginTop: '10px' 
                }}>
                    {mode === 'confirm' && (
                        <button 
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            Cancel
                        </button>
                    )}
                    <button 
                        onClick={onConfirm || onClose}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'var(--accent-color)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px var(--glass-border)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.target.style.opacity = '0.9'}
                        onMouseOut={e => e.target.style.opacity = '1'}
                    >
                        {mode === 'confirm' ? 'Continue' : 'Got it'}
                    </button>
                </div>
            </TiltedGlassCard>
        </div>
    );
}
