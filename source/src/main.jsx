import React from 'react';import {createRoot} from 'react-dom/client';import './index.css';import App from './App.jsx';import {migrateStorage} from './migrate.js';import PageFade from './PageFade.jsx';
migrateStorage();
createRoot(document.getElementById('root')).render(<><App/><PageFade/></>);
