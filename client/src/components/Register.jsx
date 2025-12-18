import { useNavigate, Link } from 'react-router-dom';
import TiltedGlassCard from './TiltedGlassCard';
import api from '../api';


export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData); // Replaced axios.post with api.post
            navigate('/login'); // Standardized login redirect
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            {showSuccess && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
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
                    <input
                        type="text" placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={isLoading}
                    />
                    <input
                        type="email" placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                    />
                    <input
                        type="password" placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                    Have an account? <Link to="/login">Sign In</Link>
                </p>
            </TiltedGlassCard>
        </div>
    );
}
