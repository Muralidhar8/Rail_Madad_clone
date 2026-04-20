import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get token if we store it there, or we'll just use the token from localStorage
import axios from 'axios';

const AdminRegister = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Get token from localStorage 'user' object
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token;

            if (!token) {
                setError('Authentication token not found. Please login again.');
                return;
            }

            const response = await axios.post('/api/auth/admin/register', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-admin-username': storedUser?.username
                }
            });

            if (response.status === 201) {
                setSuccess('New admin registered successfully!');
                setFormData({ username: '', password: '', name: '' });
                setTimeout(() => {
                    navigate('/admin');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register admin');
        }
    };

    return (
        <div className="admin-register-container" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Add New Admin</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Add Admin
                </button>
            </form>
        </div>
    );
};

export default AdminRegister;
