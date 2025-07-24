import React from 'react';
import { Link } from 'react-router-dom';

// Example icons from Heroicons (SVGs)
const DashboardIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
);
const MerchantIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V5a2 2 0 00-2-2H6a2 2 0 00-2 2v6" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8a2 2 0 002-2v-7a2 2 0 00-2-2H8a2 2 0 00-2 2v7a2 2 0 002 2z" /></svg>
);
const TerminalIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4-4-4-4m8 8h.01" /></svg>
);
const SettingsIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.4 15.9A8.001 8.001 0 0112 20a8.001 8.001 0 01-8.4-4.1" /></svg>
);

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <span className="text-xl font-bold text-blue-600 tracking-tight">Merchant Acquiring MVP</span>
        </div>
        <nav className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Register</Link>
          <Link to="/status" className="text-gray-600 hover:text-blue-600 font-medium">Status</Link>
        </nav>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col py-6 px-4">
          <nav className="space-y-2">
            <Link to="/admin-panel" className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium">
              <DashboardIcon /> Dashboard
            </Link>
            <Link to="/merchant-management" className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium">
              <MerchantIcon /> Merchants
            </Link>
            <Link to="/terminal-management" className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium">
              <TerminalIcon /> Terminals
            </Link>
            <Link to="/admin" className="flex items-center px-3 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium">
              <SettingsIcon /> Settings
            </Link>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
