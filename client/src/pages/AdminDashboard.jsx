import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, CheckCircle, XCircle, LayoutDashboard, FileText, Settings, Search, Filter, AlertCircle, Users, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [adminsList, setAdminsList] = useState([]);
    const { user } = useAuth();
    
    const isMainAdmin = user?.username === 'Muralidhar';

    // Modal State
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'assign' or 'resolve'
    const [actionData, setActionData] = useState({
        role: 'Volunteer',
        name: '',
        resolution: ''
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get('/api/auth/admins');
            setAdminsList(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (filter === 'Settings') {
            fetchAdmins();
        }
    }, [filter]);

    const fetchComplaints = async () => {
        try {
            const response = await axios.get('/api/complaints');
            setComplaints(response.data.reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedComplaint) return;

        try {
            if (modalMode === 'assign') {
                await axios.patch(`/api/complaints/${selectedComplaint.id}/assign`, {
                    assignedTo: actionData.name,
                    assignedRole: actionData.role
                });
            } else if (modalMode === 'resolve') {
                await axios.patch(`/api/complaints/${selectedComplaint.id}/status`, {
                    status: 'Resolved',
                    resolution: actionData.resolution || 'Resolved by Admin'
                });
            }

            fetchComplaints();
            closeModal();
        } catch (err) {
            alert('Action failed');
        }
    };

    const openModal = (complaint, mode) => {
        setSelectedComplaint(complaint);
        setModalMode(mode);
        setActionData({ role: 'Volunteer', name: '', resolution: '' });
    };

    const closeModal = () => {
        setSelectedComplaint(null);
        setModalMode(null);
    };

    // Stats
    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        assigned: complaints.filter(c => c.status.includes('Assigned')).length
    };

    const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c =>
        filter === 'Pending' ? c.status === 'Pending' :
            filter === 'Resolved' ? c.status === 'Resolved' :
                filter === 'Assigned' ? c.status.includes('Assigned') : true
    );

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div style={{ marginBottom: '30px', padding: '0 10px' }}>
                    <h3 style={{ color: '#8B0000', margin: 0 }}>Admin Panel</h3>
                    <p style={{ fontSize: '0.8rem', color: '#888' }}>manage grievances</p>
                </div>
                <div className={`sidebar-item ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
                    <LayoutDashboard size={20} /> Dashboard
                </div>
                <div className={`sidebar-item ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>
                    <AlertCircle size={20} /> Pending
                </div>
                <div className={`sidebar-item ${filter === 'Assigned' ? 'active' : ''}`} onClick={() => setFilter('Assigned')}>
                    <Users size={20} /> Assigned
                </div>
                <div className={`sidebar-item ${filter === 'Resolved' ? 'active' : ''}`} onClick={() => setFilter('Resolved')}>
                    <CheckCircle size={20} /> Resolved
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <div className={`sidebar-item ${filter === 'Settings' ? 'active' : ''}`} onClick={() => setFilter('Settings')}>
                        <Settings size={20} /> Settings
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-content">
                {filter === 'Settings' ? (
                    <div>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>Settings</h2>
                        
                        <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Existing Admins</h3>
                            {adminsList.length === 0 ? <p style={{ color: '#666' }}>Loading admins...</p> : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '12px 10px', color: '#555' }}>Name</th>
                                                <th style={{ padding: '12px 10px', color: '#555' }}>Username</th>
                                                <th style={{ padding: '12px 10px', color: '#555' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminsList.map(admin => (
                                                <tr key={admin.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>{admin.name}</td>
                                                    <td style={{ padding: '10px' }}>{admin.username}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        {isMainAdmin && admin.username !== 'Muralidhar' && (
                                                            <button 
                                                                onClick={async () => {
                                                                    if (window.confirm(`Are you sure you want to remove admin "${admin.name}"?`)) {
                                                                        try {
                                                                            await axios.delete(`/api/auth/admin/${admin.id}`, { headers: { 'x-admin-username': user?.username }});
                                                                            fetchAdmins();
                                                                        } catch (err) {
                                                                            alert(err.response?.data?.error || 'Error removing admin');
                                                                        }
                                                                    }
                                                                }} 
                                                                style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {isMainAdmin && (
                            <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 10px 0' }}>Add New Admin</h3>
                                <p style={{ color: '#666', marginBottom: '20px' }}>Create new admin users to help manage grievances.</p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const username = e.target.username.value;
                                    const password = e.target.password.value;
                                    const name = e.target.name.value;
                                    try {
                                        const res = await axios.post('/api/auth/admin/register', {
                                            username, password, name
                                        }, { headers: { 'x-admin-username': user?.username }});
                                        alert('Admin created successfully!');
                                        e.target.reset();
                                        fetchAdmins();
                                    } catch (err) {
                                        alert(err.response?.data?.error || 'Error creating admin');
                                    }
                                }}>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label className="form-label" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Name</label>
                                        <input type="text" name="name" className="form-control" required placeholder="Full Name" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label className="form-label" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Username</label>
                                        <input type="text" name="username" className="form-control" required placeholder="username123" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label className="form-label" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Password</label>
                                        <input type="password" name="password" className="form-control" required placeholder="Choose a secure password" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Create Admin</button>
                                </form>
                            </div>
                        )}
                    </div>
                ) : (
                <>
                {/* Stats Row */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e3f2fd', color: '#0d47a1' }}><FileText /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.total}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Complaints</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fff3e0', color: '#e65100' }}><AlertCircle /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.pending}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f3e5f5', color: '#7b1fa2' }}><Users /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.assigned}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Assigned</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e8f5e9', color: '#1b5e20' }}><CheckCircle /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.resolved}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Resolved</p>
                        </div>
                    </div>
                </div>

                <h2 style={{ marginBottom: '20px', color: '#333' }}>Recent Complaints</h2>

                {loading ? <p>Loading...</p> : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {filteredComplaints.map(complaint => (
                            <div key={complaint.id} className="complaint-card">
                                <div className="complaint-header">
                                    <div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{complaint.type}</h3>
                                            <span style={{ fontSize: '0.8rem', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>{complaint.id}</span>
                                        </div>
                                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                                            {new Date(complaint.createdAt).toLocaleString()} • {complaint.name} ({complaint.mobile})
                                        </p>
                                    </div>
                                    <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                                        {complaint.status}
                                    </span>
                                </div>

                                <p style={{ color: '#444', marginBottom: '15px', lineHeight: '1.5' }}>{complaint.description}</p>

                                {complaint.image && (
                                    <a href={`http://localhost:5000${complaint.image}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginBottom: '15px', color: 'blue', fontSize: '0.9rem' }}>
                                        View Attachment
                                    </a>
                                )}

                                {complaint.resolution && (
                                    <div style={{ background: '#f1f8e9', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', color: '#33691e' }}>
                                        <strong>Resolution:</strong> {complaint.resolution}
                                    </div>
                                )}

                                {complaint.status !== 'Resolved' && (
                                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                                            onClick={() => openModal(complaint, 'assign')}
                                        >
                                            <Users size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Assign
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                                            onClick={() => openModal(complaint, 'resolve')}
                                        >
                                            <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Resolve
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                </>
                )}
            </main>

            {/* Modal */}
            {selectedComplaint && modalMode && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal() }}>
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>
                                {modalMode === 'assign' ? 'Assign Complaint' : 'Resolve Complaint'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color="#666" /></button>
                        </div>

                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                            <strong>REF: {selectedComplaint.id}</strong> - {selectedComplaint.type}
                        </div>

                        {modalMode === 'assign' ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Assign To Role</label>
                                    <select
                                        className="form-control"
                                        value={actionData.role}
                                        onChange={(e) => setActionData({ ...actionData, role: e.target.value })}
                                    >
                                        <option>Volunteer</option>
                                        <option>Railway Official</option>
                                        <option>NGO Partner</option>
                                        <option>Police (GRP/RPF)</option>
                                        <option>Medical Team</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Name of Official/Team</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Station Master NDLS"
                                        value={actionData.name}
                                        onChange={(e) => setActionData({ ...actionData, name: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Resolution Remarks</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Describe the action taken..."
                                    value={actionData.resolution}
                                    onChange={(e) => setActionData({ ...actionData, resolution: e.target.value })}
                                ></textarea>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAction}>
                                Confirm {modalMode === 'assign' ? 'Assignment' : 'Resolution'}
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
