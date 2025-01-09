import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
    <div className="footer-links">
        <a href="/security-privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        <a href="/acceptable-use-policy.html" target="_blank" rel="noopener noreferrer">Acceptable Use Policy</a>
        <a href="/dmca-notice.html" target="_blank" rel="noopener noreferrer">DMCA Notice & Takedown Policy</a>
    </div>
    <p className="footer-text">© 2025 Destinations App – Abdalrahman Alghefari.</p>
</footer>
    );
};

export default Footer;
