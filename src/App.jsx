import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { HotelProvider } from './context/HotelContext';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <HotelProvider>
            <AppRoutes />
          </HotelProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
