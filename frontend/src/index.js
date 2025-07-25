import React from 'react';
// import './index.css'; // Tailwind CSS removed, Bootstrap is now used
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
