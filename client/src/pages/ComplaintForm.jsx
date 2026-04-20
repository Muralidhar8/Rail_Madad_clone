import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Upload, CheckCircle, Clock, Search, LogIn, User } from 'lucide-react';

const ComplaintForm = () => {
    const { user, login } = useAuth();

    // Login State
    const [nameInput, setNameInput] = useState('');
    const [mobileInput, setMobileInput] = useState('');
    const [loginError, setLoginError] = useState('');

    // Complaint Form State
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        pnr: '',
        type: 'Service-related',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refId, setRefId] = useState(null);
    const [formError, setFormError] = useState('');

    // History State
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (user) {
            // Pre-fill form
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                mobile: user.mobile || ''
            }));

            // Fetch History
            if (user.mobile) {
                fetchHistory(user.mobile);
            }
        }
    }, [user]);

    const fetchHistory = async (mobile) => {
        setLoadingHistory(true);
        try {
            const response = await axios.get(`/api/complaints/user/${mobile}`);
            setHistory(response.data.reverse());
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        if (!mobileInput || mobileInput.length !== 10) {
            setLoginError('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!nameInput.trim()) {
            setLoginError('Please enter your full name');
            return;
        }

        const result = await login({ mobile: mobileInput, name: nameInput }, 'passenger');
        if (!result.success) {
            setLoginError(result.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            const response = await axios.post('/api/complaints', data);
            setRefId(response.data.id);
            // Refresh history
            fetchHistory(user.mobile);
        } catch (err) {
            setFormError('Failed to register complaint. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 1. RENDER LOGIN FORM if not authenticated
    if (!user) {
        return (
            <div className="container" style={{ padding: '60px 0', minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}>
                    <div style={{ background: '#f8f9fa', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#8B0000' }}>
                        <User size={40} />
                    </div>
                    <h2 style={{ color: '#8B0000', marginBottom: '10px' }}>Passenger Login</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>Please verify your mobile number to access services.</p>

                    {loginError && <div style={{ color: 'red', marginBottom: '20px', background: '#fff3f3', padding: '10px', borderRadius: '4px' }}>{loginError}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group" style={{ textAlign: 'left', marginBottom: '15px' }}>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your name"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter 10-digit mobile number"
                                value={mobileInput}
                                onChange={(e) => setMobileInput(e.target.value)}
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            <LogIn size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                            Login & Continue
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // 2. RENDER SUCCESS MESSAGE if submitted
    if (refId) {
        return (
            <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card" style={{ maxWidth: '600px', margin: '0 auto', borderTop: '5px solid #28a745' }}>
                    <div style={{ color: '#28a745', marginBottom: '20px' }}>
                        <CheckCircle size={60} />
                    </div>
                    <h2 style={{ marginBottom: '20px' }}>Complaint Registered Successfully!</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Your Reference ID is:</p>
                    <div style={{ background: '#f8f9fa', padding: '15px', fontSize: '2rem', fontWeight: 'bold', color: '#333', borderRadius: '8px', marginBottom: '30px' }}>
                        {refId}
                    </div>
                    <p style={{ color: '#666' }}>Please save this ID to track your complaint status.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setRefId(null);
                            setFormData({ name: user.name, mobile: user.mobile, pnr: '', type: 'Service-related', description: '' });
                            setImage(null);
                        }}
                        style={{ marginTop: '20px' }}
                    >
                        Register Another Complaint
                    </button>
                </div>

                {/* Still show history below success message */}
                <div style={{ maxWidth: '800px', margin: '40px auto 0 auto', textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Your Recent Complaints</h3>
                    {renderHistory(history, loadingHistory)}
                </div>
            </div>
        );
    }

    // 3. RENDER COMPLAINT FORM + HISTORY
    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 40px auto', borderTop: '4px solid #8B0000' }}>
                <h2 style={{ marginBottom: '30px', color: '#8B0000', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    Register a Grievance
                </h2>
                {formError && <div style={{ color: 'red', marginBottom: '20px' }}>{formError}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" required className="form-control" value={formData.name} onChange={handleChange} readOnly style={{ background: '#f9f9f9' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input type="tel" name="mobile" required className="form-control" value={formData.mobile} onChange={handleChange} readOnly style={{ background: '#f9f9f9' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PNR / UTS Number *</label>
                            <input type="text" name="pnr" required className="form-control" value={formData.pnr} onChange={handleChange} placeholder="Enter 10-digit PNR" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Complaint Type</label>
                            <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                                <option>Service-related</option>
                                <option>Medical Assistance</option>
                                <option>Security</option>
                                <option>Staff Behavior</option>
                                <option>Cleanliness</option>
                                <option>Catering</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea name="description" required rows="4" className="form-control" value={formData.description} onChange={handleChange} placeholder="Please describe your issue in detail..."></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Upload Photo (Optional)</label>
                        <div style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <Upload size={30} color="#666" />
                                <p style={{ marginTop: '10px', color: '#666' }}>{image ? image.name : 'Click to Upload Image'}</p>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Your Recent Complaints</h3>
                {renderHistory(history, loadingHistory)}
            </div>
        </div>
    );
};

// Helper to render history list
const renderHistory = (history, loading) => {
    if (loading) return <p>Loading history...</p>;
    if (history.length === 0) return <p style={{ color: '#666', fontStyle: 'italic' }}>No previous complaints found.</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {history.map(complaint => (
                <div key={complaint.id} className="card" style={{ borderLeft: `5px solid ${complaint.status === 'Resolved' ? '#28a745' : '#ffc107'}`, padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{complaint.type}</h4>
                            <span style={{ fontSize: '0.85rem', color: '#888', background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                REF: {complaint.id}
                            </span>
                        </div>
                        <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                            {complaint.status === 'Resolved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                            <span style={{ marginLeft: '5px' }}>{complaint.status}</span>
                        </span>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.95rem', margin: '10px 0' }}>{complaint.description}</p>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        {new Date(complaint.createdAt).toLocaleDateString()} | PNR: {complaint.pnr}
                    </div>
                    {complaint.resolution && (
                        <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '4px', border: '1px solid #c3e6cb', color: '#155724', fontSize: '0.9rem' }}>
                            <strong>Resolution:</strong> {complaint.resolution}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ComplaintForm;
