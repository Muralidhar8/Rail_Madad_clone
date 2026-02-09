import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'white', borderBottom: '1px solid #eee' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ background: '#8B0000', padding: '8px', borderRadius: '50%', color: 'white' }}>
                        <Train size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', color: '#8B0000', fontWeight: 'bold', margin: 0 }}>Rail Madad</h1>
                        <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>For Inquiry, Assistance & Grievance Redressal</p>
                    </div>
                </Link>
                <nav>
                    <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
                        <li><Link to="/" style={{ fontWeight: '500', color: '#333', textDecoration: 'none' }}>Home</Link></li>
                        <li><Link to="/register" style={{ fontWeight: '500', color: '#333', textDecoration: 'none' }}>Passenger Login</Link></li>
                        <li><Link to="/track" style={{ fontWeight: '500', color: '#333', textDecoration: 'none' }}>Track Status</Link></li>
                        {user ? (
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', color: '#8B0000', display: 'flex', alignItems: 'center' }}>
                                    <User size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    {user.name}
                                </span>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <LogOut size={18} />
                                </button>
                            </li>
                        ) : (
                            <li style={{ display: 'flex', gap: '20px' }}>
                                <Link to="/admin-login" style={{ fontWeight: '500', color: '#333', textDecoration: 'none' }}>Admin Login</Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
