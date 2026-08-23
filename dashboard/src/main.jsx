import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { I18nProvider } from './i18n/index.jsx';
import { BrandingProvider, fetchBranding, applyBrandingToDocument } from './branding.jsx';
import './styles.css';

fetchBranding().then((branding) => {
  applyBrandingToDocument(branding);
  createRoot(document.getElementById('root')).render(
    <BrandingProvider branding={branding}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrandingProvider>,
  );
});
