import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import FluidBackground from './FluidBackground';
import RippleEffect from './RippleEffect';

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <FluidBackground />
            <RippleEffect />

            {/* Fake Window Header */}
            <div className="glass-panel" style={{ margin: '20px', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }}></div>
                </div>
                <div style={{ fontWeight: 600 }}>My Private Space</div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 5 }}>
                    <LogOut size={18} />
                </button>
            </div>

            <div className="glass-panel content-area" style={{ flex: 1, margin: '0 20px 20px 20px', padding: '20px', overflowY: 'auto', position: 'relative' }}>
                <Outlet />
            </div>
        </div>
    );
}
