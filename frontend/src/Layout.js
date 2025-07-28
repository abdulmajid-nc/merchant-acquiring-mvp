import React from 'react';
import { Link } from 'react-router-dom';

// Example icons from Heroicons (SVGs)
const DashboardIcon = () => (
  <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
);
const MerchantIcon = () => (
  <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V5a2 2 0 00-2-2H6a2 2 0 00-2 2v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8a2 2 0 002-2v-7a2 2 0 00-2-2H8a2 2 0 00-2 2v7a2 2 0 002 2z" /></svg>
);
const TerminalIcon = () => (
  <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4-4-4-4m8 8h.01" /></svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.4 15.9A8.001 8.001 0 0112 20a8.001 8.001 0 01-8.4-4.1" /></svg>
);
const MccIcon = () => (
  <svg width="20" height="20" className="mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
);

export default function Layout({ children }) {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f8f9fc' }}>
      {/* Sidebar - SB Admin style, always visible */}
      <nav className="sidebar bg-primary text-white" style={{ width: '250px', minHeight: '100vh', boxShadow: '0 0 30px rgba(0,0,0,0.05)' }}>
        <div className="sidebar-header d-flex align-items-center justify-content-center py-4 border-bottom border-light">
          <span className="h4 fw-bold" style={{ color: '#fff' }}>NymCard</span>
        </div>
        <ul className="nav flex-column mt-4">
          <li className="nav-item mb-2">
            <Link to="/admin-panel" className="nav-link text-white fw-medium px-3 py-2">
              <DashboardIcon /> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/merchant-management" className="nav-link text-white fw-medium px-3 py-2">
              <MerchantIcon /> Merchants
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/terminal-management" className="nav-link text-white fw-medium px-3 py-2">
              <TerminalIcon /> Terminals
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/mcc-management" className="nav-link text-white fw-medium px-3 py-2">
              <MccIcon /> MCC Codes
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin" className="nav-link text-white fw-medium px-3 py-2">
              <SettingsIcon /> Settings
            </Link>
          </li>
        </ul>
        <div className="mt-auto pt-4 text-center">
          <span className="text-light small">© 2025 NymCard</span>
        </div>
      </nav>
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Topbar - SB Admin style */}
        <nav className="navbar navbar-expand navbar-light bg-white shadow-sm px-4 py-3 border-bottom">
          <span className="h4 fw-bold text-primary">Merchant Acquiring MVP</span>
          <div className="ms-auto">
            <Link to="/" className="text-secondary fw-medium me-3">Register</Link>
            <Link to="/status" className="text-secondary fw-medium">Status</Link>
          </div>
        </nav>
        <main className="container-fluid py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
