/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages - Authentication & Onboarding
import { Intro } from './pages/Intro';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';

// Pages - Main Application
import { Home } from './pages/Home';
import { Agreements } from './pages/Agreements';
import { SosMode } from './pages/SosMode';
import { Exchanges } from './pages/Exchanges';
import { Points } from './pages/Points';
import { Surprise } from './pages/Surprise';
import { Checkin } from './pages/Checkin';
import { Profile } from './pages/Profile';
import { Integrations } from './pages/Integrations';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Privacy } from './pages/Privacy';
import { EmpathyBox } from './pages/EmpathyBox';
import { SaiaDaRotina } from './pages/SaiaDaRotina';
import { AdminGestures } from './pages/AdminGestures';

import { useTheme } from './hooks/useTheme';

/**
 * Main application component that sets up routing and global providers.
 */
export default function App() {
  // Initialize theme based on user preference
  useTheme();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
            <Route path="/" element={<Intro />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected/App Routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/agreements" element={<ProtectedRoute><Agreements /></ProtectedRoute>} />
            <Route path="/sos" element={<ProtectedRoute><SosMode /></ProtectedRoute>} />
            <Route path="/exchanges" element={<ProtectedRoute><Exchanges /></ProtectedRoute>} />
            <Route path="/points" element={<ProtectedRoute><Points /></ProtectedRoute>} />
            <Route path="/surprise" element={<ProtectedRoute><Surprise /></ProtectedRoute>} />
            <Route path="/checkin" element={<ProtectedRoute><Checkin /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
            <Route path="/empathy-box" element={<ProtectedRoute><EmpathyBox /></ProtectedRoute>} />
            <Route path="/next-date" element={<ProtectedRoute><SaiaDaRotina /></ProtectedRoute>} />
            <Route path="/admin-gestures" element={<ProtectedRoute><AdminGestures /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
