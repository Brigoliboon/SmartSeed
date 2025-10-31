"use client"

import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { AppSidebar } from './components/layout/AppSidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { MobileDashboard } from './components/dashboard/MobileDashboard';
import { InventoryPage } from './components/inventory/InventoryPage';
import { BedsPage } from './components/beds/BedsPage';
import { MobileBedsPage } from './components/beds/MobileBedsPage';
import { ScanningPage } from './components/scanning/ScanningPage';
import { QRManagementPage } from './components/qr/QRManagementPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { Bed, ScanLine } from 'lucide-react';

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      // Force mobile mode with URL parameter: ?mobile=true
      const urlParams = new URLSearchParams(window.location.search);
      const forceMobile = urlParams.get('mobile') === 'true';
      const forceDesktop = urlParams.get('mobile') === 'false';
      
      if (forceMobile) {
        setIsMobile(true);
        console.log('🔧 Mobile mode FORCED via URL parameter');
        return;
      }
      
      if (forceDesktop) {
        setIsMobile(false);
        console.log('🖥️ Desktop mode FORCED via URL parameter');
        return;
      }
      
      // More accurate mobile detection - must have BOTH small width AND touch
      const isMobileWidth = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Only consider it mobile if screen is small (not just touch-capable)
      const isMobileDevice = isMobileWidth;
      setIsMobile(isMobileDevice);
      
      console.log('📱 Mobile detection:', { 
        width: window.innerWidth,
        isMobileWidth, 
        isTouchDevice, 
        isMobileDevice 
      });
      
      // Set default page based on device type
      if (isMobileDevice && !currentPage) {
        setCurrentPage('scanning');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Smartseed...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex justify-center w-full">
          {authMode === 'login' ? (
            <LoginForm
              onLogin={signIn}
              onSwitchToSignup={() => setAuthMode('signup')}
            />
          ) : (
            <SignupForm
              onSignup={signUp}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  // Render main application
  
  // Mobile Layout for ALL users when on mobile device
  if (isMobile) {
    console.log('🎯 Rendering MOBILE layout for user:', user.role);
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          user={user}
          onSignOut={signOut}
        />
        <main className="pb-20">
          {currentPage === 'beds' && <MobileBedsPage />}
          {currentPage === 'scanning' && <ScanningPage user={user} />}
          {currentPage === 'dashboard' && <MobileDashboard user={user} onNavigate={setCurrentPage} />}
        </main>
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="grid grid-cols-2 gap-0">
            <button
              onClick={() => setCurrentPage('beds')}
              className={`flex flex-col items-center gap-1.5 py-3 transition-all ${
                currentPage === 'beds'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600'
              }`}
            >
              <Bed className={`w-6 h-6 ${currentPage === 'beds' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">My Beds</span>
            </button>
            <button
              onClick={() => setCurrentPage('scanning')}
              className={`flex flex-col items-center gap-1.5 py-3 transition-all ${
                currentPage === 'scanning'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600'
              }`}
            >
              <ScanLine className={`w-6 h-6 ${currentPage === 'scanning' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">Scan QR</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout (for all users) and Admin on Mobile
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <AppSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onSignOut={signOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {currentPage === 'dashboard' && <DashboardPage user={user} />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'beds' && <BedsPage />}
          {currentPage === 'qr' && <QRManagementPage />}
          {currentPage === 'scanning' && <ScanningPage user={user} />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'settings' && <SettingsPage user={user} />}
        </div>
      </main>
    </div>
  );
}
