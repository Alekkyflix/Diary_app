import React, { useState, useEffect } from 'react';
import { MousePointer2, X } from 'lucide-react';

export default function CursorToggle() {
    const [enabled, setEnabled] = useState(localStorage.getItem('customCursor') !== 'false');

    useEffect(() => {
        localStorage.setItem('customCursor', enabled);
        if (enabled) {
            document.body.classList.add('custom-cursor-active');
            document.documentElement.classList.add('custom-cursor-active');
        } else {
            document.body.classList.remove('custom-cursor-active');
            document.documentElement.classList.remove('custom-cursor-active');
        }

    }, [enabled]);


    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 100001,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            padding: '8px 12px',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '0.8rem',
            pointerEvents: 'auto'
        }}>
            <MousePointer2 size={14} color={enabled ? 'var(--accent-color)' : 'white'} />
            <span style={{ opacity: 0.8 }}>{enabled ? 'Custom Cursor' : 'System Cursor'}</span>
            <button 
                onClick={() => setEnabled(!enabled)}
                style={{
                    background: enabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    width: '30px',
                    height: '16px',
                    borderRadius: '10px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                }}
            >
                <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: enabled ? '16px' : '2px',
                    transition: 'left 0.3s'
                }} />
            </button>
        </div>
    );
}
