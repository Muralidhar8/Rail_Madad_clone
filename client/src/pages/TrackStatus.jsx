import React, { useState } from 'react';
import axios from 'axios';
import { Search, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const TrackStatus = () => {
    const [searchInput, setSearchInput] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        setLoading(true);
        setError('');
        setComplaints([]);
        setSearched(true);

        const input = searchInput.trim();
        const isMobile = /^\d{10}$/.test(input);

        try {
            let response;
            if (isMobile) {
                response = await axios.get(`/api/complaints/user/${input}`);
                setComplaints(response.data.reverse());
            } else {
                response = await axios.get(`/api/complaints/${input}`);
                // API returns single object for ID, wrap in array
                setComplaints([response.data]);
            }
        } catch (err) {
            setError(isMobile ? 'No complaints found for this mobile number.' : 'Complaint not found with this ID.');
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '60px 0', minHeight: '60vh' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#1a237e', marginBottom: '10px' }}>Track Your Grievance</h2>
                    <p style={{ color: '#666' }}>Enter your Reference ID or Registered Mobile Number</p>
                </div>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Reference ID or Mobile Number"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {loading ? <div className="spinner"></div> : <Search size={20} />}
                    </button>
                </form>

                {error && (
                    <div style={{ textAlign: 'center', color: 'red', marginBottom: '20px', padding: '10px', background: '#fff3f3', borderRadius: '4px' }}>
                        <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        {error}
                    </div>
                )}

                {searched && !loading && !error && complaints.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                        No records found.
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {complaints.map(complaint => (
                        <div key={complaint.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{complaint.type}</h3>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        <span style={{ fontWeight: 'bold' }}>REF:</span> {complaint.id} | <span style={{ fontWeight: 'bold' }}>Date:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        <span style={{ fontWeight: 'bold' }}>PNR:</span> {complaint.pnr} | <span style={{ fontWeight: 'bold' }}>Mobile:</span> {complaint.mobile}
                                    </div>
                                </div>
                                <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <strong style={{ color: '#555' }}>Description:</strong>
                                <p style={{ marginTop: '5px', color: '#555', background: '#f9f9f9', padding: '10px', borderRadius: '4px', lineHeight: '1.5' }}>
                                    {complaint.description}
                                </p>
                            </div>

                            {complaint.resolution ? (
                                <div style={{ marginTop: '20px', background: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#155724', fontWeight: 'bold', marginBottom: '5px' }}>
                                        <CheckCircle size={18} /> Resolution
                                    </div>
                                    <p style={{ margin: 0, color: '#155724' }}>{complaint.resolution}</p>
                                </div>
                            ) : (
                                <div style={{ marginTop: '20px', color: '#856404', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={16} /> Work in progress.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrackStatus;
