/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Onboarding } from './pages/Onboarding';
import { Intro } from './pages/Intro';
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

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/agreements" element={<Agreements />} />
            <Route path="/sos" element={<SosMode />} />
            <Route path="/exchanges" element={<Exchanges />} />
            <Route path="/points" element={<Points />} />
            <Route path="/surprise" element={<Surprise />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/empathy-box" element={<EmpathyBox />} />
            <Route path="/next-date" element={<SaiaDaRotina />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
