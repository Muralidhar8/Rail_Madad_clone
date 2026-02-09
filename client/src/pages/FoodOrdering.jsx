import React, { useState } from 'react';
import { Utensils, Search, ShoppingBag, Plus } from 'lucide-react';

const FoodOrdering = () => {
    const [pnr, setPnr] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [cart, setCart] = useState([]);

    const handleCheckPnr = (e) => {
        e.preventDefault();
        if (pnr.length === 10) setShowMenu(true);
    };

    const addToCart = (item) => {
        setCart([...cart, item]);
        alert(`Added ${item.name} to cart!`);
    };

    const menuItems = [
        { id: 1, name: 'Standard Veg Thali', price: 150, image: '🍛' },
        { id: 2, name: 'Egg Biryani', price: 180, image: '🥘' },
        { id: 3, name: 'Chicken Curry & Rice', price: 220, image: '🍗' },
        { id: 4, name: 'Masala Dosa', price: 100, image: '🥞' },
        { id: 5, name: 'Sandwich & Coffee', price: 120, image: '🥪' },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#8B0000', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Utensils /> E-Catering
            </h2>

            {!showMenu ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px' }}>Enter PNR to Order Food</h3>
                    <form onSubmit={handleCheckPnr} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 10-digit PNR"
                            maxLength="10"
                            value={pnr}
                            onChange={e => setPnr(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                            View Menu
                        </button>
                    </form>
                    <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                        Order delicious meals directly to your seat.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <p style={{ fontWeight: 'bold' }}>Ordering for PNR: <span style={{ color: '#8B0000' }}>{pnr}</span></p>
                        <div style={{ background: '#fff', padding: '8px 15px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShoppingBag size={18} />
                            <span>{cart.length} Items</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {menuItems.map(item => (
                            <div key={item.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '120px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                    {item.image}
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                    <p style={{ color: '#666', marginBottom: '15px' }}>₹{item.price}</p>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}
                                        onClick={() => addToCart(item)}
                                    >
                                        <Plus size={16} style={{ verticalAlign: 'middle' }} /> Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FoodOrdering;
