/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ContentPlan from './pages/ContentPlan';
import AdsPlan from './pages/AdsPlan';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PendingApproval from './pages/PendingApproval';
import ErrorBoundary from './components/ErrorBoundary';
import { useStore } from './store';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, isAuthReady, isDeviceApproved } = useStore();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (!isDeviceApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/content" element={<ContentPlan />} />
                    <Route path="/ads" element={<AdsPlan />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </ErrorBoundary>
  );
}
