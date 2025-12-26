import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Settings, LayoutDashboard, Share2, HelpCircle, User } from 'lucide-react';
import CustomAlert from './CustomAlert';

export default function Layout() {
    const navigate = useNavigate();
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'info', title: '', message: '', mode: 'alert', onConfirm: null });

    const handleLogout = () => {
        setAlertConfig({
            isOpen: true,
            type: 'warning',
            title: 'Confirm Logout',
            message: 'Are you sure you want to log out of DIARY_OS? Any unsaved changes might be lost.',
            mode: 'confirm',
            onConfirm: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                window.location.reload();
            }
        });
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Background/Effects moved to App.jsx */}

            {/* Window Header */}
            <div className="glass-panel" style={{ margin: '20px', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }}></div>
                    <div style={{ marginLeft: '15px', fontWeight: 600, fontSize: '0.9em', opacity: 0.8, letterSpacing: '1px' }}>DIARY_OS v2.0</div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/')} title="Dashboard" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 5 }}>
                        <LayoutDashboard size={20} />
                    </button>
                    <button onClick={() => navigate('/social')} title="Social Hub" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 5 }}>
                        <Share2 size={20} />
                    </button>
                    <button onClick={() => navigate('/support')} title="Support" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 5 }}>
                        <HelpCircle size={20} />
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <button onClick={() => navigate('/settings')} title="Settings" style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 5 }}>
                        <Settings size={20} />
                    </button>
                    <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', padding: 5 }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="glass-panel content-area" style={{ 
                flex: 1, 
                margin: '0 20px 20px 20px', 
                padding: '30px', 
                overflowY: 'auto', 
                position: 'relative',
                zIndex: 10
            }}>
                <Outlet />
            </div>

            <CustomAlert 
                {...alertConfig} 
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} 
            />
        </div>
    );
}
