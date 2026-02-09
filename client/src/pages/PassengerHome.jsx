import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ComplaintForm from './ComplaintForm';
import TicketBooking from './TicketBooking';
import FoodOrdering from './FoodOrdering';
import { AlertTriangle, Train, Utensils } from 'lucide-react';

const PassengerHome = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('grievance');

    if (!user) {
        // Since ComplaintForm handles login internally, we might want to let it render if user is null
        // But this is a "Portal", so maybe we enforce login here?
        // Actually, ComplaintForm has a login UI. 
        // Let's use ComplaintForm's login as the entry point.
        // If not logged in, show ComplaintForm(which shows login).
        return <ComplaintForm />;
    }

    if (user.role !== 'passenger') {
        return <Navigate to="/" />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'grievance':
                return <ComplaintForm />;
            case 'tickets':
                return <TicketBooking />;
            case 'food':
                return <FoodOrdering />;
            default:
                return <ComplaintForm />;
        }
    };

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            {/* Header / Welcome */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ color: '#8B0000', marginBottom: '10px' }}>Namaste, {user.name}</h1>
                <p style={{ color: '#666' }}>One app for all your railway needs.</p>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '40px',
                flexWrap: 'wrap'
            }}>
                <button
                    className={`btn ${activeTab === 'grievance' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('grievance')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <AlertTriangle size={18} /> Grievance
                </button>
                <button
                    className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('tickets')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Train size={18} /> Book Tickets
                </button>
                <button
                    className={`btn ${activeTab === 'food' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('food')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Utensils size={18} /> Order Food
                </button>
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '500px' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default PassengerHome;
