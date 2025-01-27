import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <style>{'body { background-color: #FFF1CE; }'}</style>
        <div style={{fontFamily: 'Roboto, sans-serif'}}><App/></div>
    </React.StrictMode>
);
