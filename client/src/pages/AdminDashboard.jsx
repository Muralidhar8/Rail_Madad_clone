import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, CheckCircle, XCircle, LayoutDashboard, FileText, Settings, Search, Filter, AlertCircle, Users, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

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
                    <div className="sidebar-item">
                        <Settings size={20} /> Settings
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-content">
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
