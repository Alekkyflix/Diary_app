import { useNavigate, Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';


export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setError('Please enter username and password');
            return;
        }

        try {
            const res = await api.post('/auth/login', { email: formData.username, password: formData.password }); // Changed to api.post and used formData
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.themePreference) {
                localStorage.setItem('theme', res.data.user.themePreference);
            }
            if (res.data.user.pfpUrl) { // Added pfpUrl storage based on instruction
                localStorage.setItem('pfpUrl', res.data.user.pfpUrl);
            }
            navigate('/');
            window.location.reload(); // Kept this line from original code
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            <TiltedGlassCard style={{ padding: '40px', width: '320px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Welcome Back</h2>
                {error && <div style={{ color: '#FF5F56', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text" placeholder="Username or Email"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <input
                        type="password" placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Sign In</button>
                </form>

                <div style={{ marginTop: '15px', marginBottom: '5px', position: 'relative', zIndex: 50 }}>
                    <Link
                        to="/forgot-password"
                        style={{
                            color: '#FF2E63',
                            fontWeight: 'bold',
                            fontSize: '0.9em',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            padding: '5px 10px',
                            display: 'inline-block',
                            pointerEvents: 'auto'
                        }}
                    >
                        Forgot Password?
                    </Link>
                </div>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    No account? <Link to="/register">Register</Link>
                </p>
            </TiltedGlassCard>
        </div>
    );
}
