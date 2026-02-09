import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Phone, FileText } from 'lucide-react';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero" style={{
                background: 'linear-gradient(135deg, #8B0000 0%, #1a237e 100%)',
                color: 'white',
                padding: '80px 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '800' }}>Grievance Redressal Mechanism</h1>
                    <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: '0.9' }}>
                        Fast, Efficient, and Transparent resolution of passenger complaints.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn" style={{
                            background: '#ffc107',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <AlertTriangle size={20} /> Lodge a Complaint
                        </Link>
                        <Link to="/track" className="btn" style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Search size={20} /> Track Status
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features" style={{ padding: '60px 0' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>Our Services</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#8B0000', marginBottom: '15px' }}>
                                <FileText size={40} />
                            </div>
                            <h3>Register Complaint</h3>
                            <p style={{ color: '#666', marginTop: '10px' }}>
                                Easy and quick registration of complaints regarding cleanliness, food, staff behavior, etc.
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#1a237e', marginBottom: '15px' }}>
                                <Search size={40} />
                            </div>
                            <h3>Track Status</h3>
                            <p style={{ color: '#666', marginTop: '10px' }}>
                                Real-time tracking of your grievance status with unique reference ID.
                            </p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ color: '#ffc107', marginBottom: '15px' }}>
                                <Phone size={40} />
                            </div>
                            <h3>24x7 Helpline</h3>
                            <p style={{ color: '#666', marginTop: '10px' }}>
                                Integrated helpline 139 for all inquiries and assistance during travel.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
