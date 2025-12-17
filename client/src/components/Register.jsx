import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TiltedGlassCard style={{ padding: '40px', width: '320px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Create Account</h2>
                {error && <div style={{ color: '#FF5F56', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text" placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="email" placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="password" placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    Have an account? <Link to="/login">Sign In</Link>
                </p>
            </TiltedGlassCard>
        </div>
    );
}
