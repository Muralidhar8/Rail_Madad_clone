import React from 'react';

const Footer = () => {
    return (
        <footer style={{ background: '#333', color: 'white', padding: '20px 0', marginTop: 'auto' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <p>&copy; 2024 Rail Madad. All rights reserved.</p>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '10px' }}>
                    Disclaimer: This is a project for educational purposes. Not affiliated with Indian Railways. Developed by Muralidhar.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
