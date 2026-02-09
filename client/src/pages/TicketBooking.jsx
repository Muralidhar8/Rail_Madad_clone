import React, { useState } from 'react';
import { Search, Train, Calendar, MapPin, CheckCircle } from 'lucide-react';

const TicketBooking = () => {
    const [search, setSearch] = useState({ from: '', to: '', date: '' });
    const [results, setResults] = useState([]);
    const [booking, setBooking] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock results
        setResults([
            { id: 1, name: 'Rajdhani Express', number: '12951', dep: '16:30', arr: '08:30', price: '₹2450', class: '2A' },
            { id: 2, name: 'Shatabdi Express', number: '12002', dep: '06:00', arr: '11:30', price: '₹1200', class: 'CC' },
            { id: 3, name: 'Duronto Express', number: '12259', dep: '11:00', arr: '06:00', price: '₹1850', class: '3A' },
        ]);
        setBooking(null);
    };

    const handleBook = (train) => {
        setBooking(train);
        // Simulate API call
        setTimeout(() => {
            alert(`Ticket booked successfully regarding PNR: ${Math.floor(Math.random() * 9000000000) + 1000000000}`);
        }, 500);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#8B0000', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Train /> Book Train Tickets
            </h2>

            <div className="card" style={{ marginBottom: '30px', padding: '25px' }}>
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">From Station</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', top: '15px', left: '12px', color: '#666' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. New Delhi"
                                style={{ paddingLeft: '35px' }}
                                required
                                value={search.from}
                                onChange={e => setSearch({ ...search, from: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">To Station</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', top: '15px', left: '12px', color: '#666' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Mumbai"
                                style={{ paddingLeft: '35px' }}
                                required
                                value={search.to}
                                onChange={e => setSearch({ ...search, to: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Journey Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', top: '15px', left: '12px', color: '#666' }} />
                            <input
                                type="date"
                                className="form-control"
                                style={{ paddingLeft: '35px' }}
                                required
                                value={search.date}
                                onChange={e => setSearch({ ...search, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '48px' }}>
                        Search Trains
                    </button>
                </form>
            </div>

            {results.length > 0 && (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {results.map(train => (
                        <div key={train.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', border: '1px solid #eee' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{train.name} <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>({train.number})</span></h3>
                                <p style={{ margin: 0, color: '#555' }}>
                                    <strong>{train.dep}</strong> ➔ <strong>{train.arr}</strong> • {train.class}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8B0000', marginBottom: '5px' }}>{train.price}</div>
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                                    onClick={() => handleBook(train)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {booking && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={20} />
                    <span>Booking simulated for <strong>{booking.name}</strong>. Check your SMS for details.</span>
                </div>
            )}
        </div>
    );
};

export default TicketBooking;
