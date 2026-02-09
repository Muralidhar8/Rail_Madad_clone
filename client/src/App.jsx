import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import PassengerHome from './pages/PassengerHome';
import TrackStatus from './pages/TrackStatus';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';

const ProtectedRoute = ({ children, roles }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/admin-login" />;
    }
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <Header />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/admin-login" element={<AdminLogin />} />
                            <Route path="/register" element={<PassengerHome />} />
                            <Route path="/track" element={<TrackStatus />} />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute roles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
