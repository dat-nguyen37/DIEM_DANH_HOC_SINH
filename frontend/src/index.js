import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {EuiProvider} from '@elastic/eui'
import 'react-toastify/dist/ReactToastify.css';
import "@elastic/eui/dist/eui_theme_light.css";
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <EuiProvider>
    <App />
  </EuiProvider>
);

