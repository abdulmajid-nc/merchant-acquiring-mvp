import React, { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

// Heroicons (replacing Bootstrap icons)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
  </svg>
);

const TransactionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const MerchantIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const MDREngineIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const RiskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DisputesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const FeeStructureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-0 transition-colors duration-300">
      {/* Notification space - adding extra padding at the top for notifications */}
      <div className="h-16"></div>
      {/* Sidebar */}
  <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar header */}
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <img src="/nymcard-logo.svg" alt="Nymcard Logo" className="h-8 w-8" />
            </div>
            <span className="ml-3 text-xl font-bold text-blue-gray-900 dark:text-white">Nymcard Acquire</span>
          </div>
          {/* Close button (mobile only) */}
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={() => setSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar menu */}
  <nav className="mt-4 px-3">
          <div className="space-y-1">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-2 mb-2 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle light/dark mode"
            >
              {theme === 'dark' ? (
                <>
                  <MoonIcon />
                  Dark Mode
                </>
              ) : (
                <>
                  <SunIcon />
                  Light Mode
                </>
              )}
            </button>
            <Link 
              to="/admin-panel" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/admin-panel') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/admin-panel') ? <DashboardIcon /> : <DashboardIcon />}</span>
              Dashboard
            </Link>
            
            <Link 
              to="/status" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/status') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/status') ? <TransactionsIcon /> : <TransactionsIcon />}</span>
              Transactions
            </Link>
            
            <Link 
              to="/merchant-management" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/merchant-management') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/merchant-management') ? <MerchantIcon /> : <MerchantIcon />}</span>
              Merchants
            </Link>
            
            <Link 
              to="/terminal-management" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/terminal-management') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/terminal-management') ? <TerminalIcon /> : <TerminalIcon />}</span>
              POS Terminals
            </Link>
            
            <Link 
              to="/mcc-management" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/mcc-management') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/mcc-management') ? <MDREngineIcon /> : <MDREngineIcon />}</span>
              MDR Engine
            </Link>
            <Link 
              to="/direct-test" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/direct-test') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/direct-test') ? <RiskIcon /> : <RiskIcon />}</span>
              Risk & Compliance
            </Link>
            
            <Link 
              to="/debug" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/debug') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/debug') ? <DisputesIcon /> : <DisputesIcon />}</span>
              Disputes
            </Link>
            
            <Link 
              to="/fee-structure-management" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/fee-structure-management') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/fee-structure-management') ? <FeeStructureIcon /> : <FeeStructureIcon />}</span>
              Fee Structures
            </Link>
            
            <Link 
              to="/admin" 
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                isActive('/admin') 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{isActive('/admin') ? <SettingsIcon /> : <SettingsIcon />}</span>
              Settings
            </Link>
          </div>
        </nav>
        
        {/* Support section */}
  <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-2">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Support</h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">Need help? Contact our 24/7 support team.</p>
          </div>
          <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Get Help
          </button>
        </div>
      </aside>
      
      {/* Content area */}
  <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
  <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Left section - Mobile menu button & Search */}
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button 
                  className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Search */}
                <div className="ml-4 flex md:ml-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      type="search" 
                      placeholder="Search transactions, merchants..." 
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Right section - Status indicator, notifications, profile */}
              <div className="flex items-center">
                {/* System status */}
                <div className="flex items-center px-3">
                  <div className="flex items-center">
                    <span className="h-2.5 w-2.5 bg-green-400 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">System Online</span>
                  </div>
                </div>
                
                {/* Notification bell */}
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 relative">
                  <span className="sr-only">View notifications</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs text-white text-center">3</span>
                </button>
                
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      JD
                    </div>
                    <div className="ml-2 hidden md:block">
                      <div className="text-sm font-medium text-gray-800">John Doe</div>
                      <div className="text-xs text-gray-500">Admin</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
  <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
