import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function PostItem() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('lnf_user'));
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'found',
        contact_info: user?.phone || '',
        image_url: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user?.id) {
            setError('User session not found. Please log in again.');
            return;
        }

        if (!form.title || !form.description || !form.contact_info) {
            setError('Please fill in all required fields.');
            return;
        }

        if (!['found', 'lost'].includes(form.status)) {
            setError('Please select item status.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/post_item.php', {
                ...form,
                user_id: user.id
            });
            setSuccess('Item posted successfully! Redirecting…');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post item.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('lnf_user');
        navigate('/login');
    };

    return (
        <div>
            <nav className="navbar">
                <Link className="navbar-brand" to="/">
                    <span className="brand-icon">🔍</span>
                    Lost &amp; Found
                </Link>
                <div className="navbar-right">
                    <span className="nav-username">👤 {user?.username}</span>
                    <Link to="/"><button className="btn-sm btn-outline">← Back</button></Link>
                    <button className="btn-sm btn-outline" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="post-page">
                <div className="post-card">
                    <h2>Post an Item</h2>
                    <p className="subtitle">Help reunite people with their belongings</p>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Item Type *</label>
                            <div className="radio-group">
                            {['found', 'lost'].map(s => (
                                <label
                                    key={s}
                                    className={`radio-label ${s}-opt${form.status === s ? ' selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={form.status === s}
                                        onChange={() => setForm({ ...form, status: s })}
                                    />
                                    {s === 'found' ? '✅ I Found This' : '❌ I Lost This'}
                                </label>
                            ))}
                        </div>
                    </div>

                        <div className="form-group">
                            <label>Item Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Blue Backpack, iPhone 14, Keys…"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                placeholder="Describe the item — color, brand, where it was found/lost, any distinguishing features…"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Info *</label>
                            <input
                                type="text"
                                placeholder="Phone number or email"
                                value={form.contact_info}
                                onChange={e => setForm({ ...form, contact_info: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Image URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                            <input
                                type="url"
                                placeholder="https://example.com/photo.jpg"
                                value={form.image_url}
                                onChange={e => setForm({ ...form, image_url: e.target.value })}
                            />
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? 'Posting…' : '🚀 Post Item'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
