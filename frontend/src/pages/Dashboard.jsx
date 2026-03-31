import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('lnf_user'));
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchItems = async (status) => {
        setLoading(true);
        try {
            const url = status === 'all'
                ? '/get_items.php'
                : `/get_items.php?status=${status}`;
            const res = await api.get(url);
            setItems(res.data.items);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(filter); }, [filter]);

    const handleLogout = () => {
        localStorage.removeItem('lnf_user');
        navigate('/login');
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <Link className="navbar-brand" to="/">
                    <span className="brand-icon">🔍</span>
                    Lost &amp; Found
                </Link>
                <div className="navbar-right">
                    <span className="nav-username">👤 {user?.username}</span>
                    <Link to="/post">
                        <button className="btn-sm btn-accent">+ Post Item</button>
                    </Link>
                    <button className="btn-sm btn-outline" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            {/* Hero */}
            <div className="dashboard-page">
                <div className="dashboard-hero">
                    <h2>Community Lost &amp; Found</h2>
                    <p>Browse found items or post something you discovered</p>
                    <div className="filter-bar">
                        {['all', 'found', 'lost'].map(f => (
                            <button
                                key={f}
                                className={`filter-btn${filter === f ? ' active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? '🌐 All Items' : f === 'found' ? '✅ Found' : '❌ Lost'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="loading-container"><div className="spinner" /></div>
                ) : (
                    <div className="items-grid">
                        {items.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <h3>No items yet</h3>
                                <p>Be the first to post a found item!</p>
                            </div>
                        ) : (
                            items.map((item, i) => (
                                <div className="item-card" key={item.id} style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="item-card-img">
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (item.status === 'found' ? '📦' : '❓')}
                                    </div>
                                    <div className="item-card-body">
                                        <span className={`item-badge badge-${item.status}`}>
                                            {item.status === 'found' ? '✅ Found' : '❌ Lost'}
                                        </span>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        <div className="item-contact">
                                            <a
                                                className="contact-finder-btn"
                                                href={`https://wa.me/${item.contact_info.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                📱 Contact Finder
                                            </a>
                                            <span className="item-meta">{formatDate(item.created_at)}</span>
                                        </div>
                                        <div className="item-contact" style={{ marginTop: '0.3rem', borderTop: 'none', paddingTop: '0' }}>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                Posted by <strong style={{ color: 'var(--primary)' }}>{item.username}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
