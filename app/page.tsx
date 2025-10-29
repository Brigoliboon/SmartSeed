import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { AppSidebar } from './components/layout/AppSidebar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { ScanningPage } from './components/scanning/ScanningPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { SettingsPage } from './components/settings/SettingsPage';

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading SmartSeed...</p>
        </div>
      </div>
    );
  }

  // Show authentication screen if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full">
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
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'scanning' && <ScanningPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'settings' && <SettingsPage user={user} />}
        </div>
      </main>
    </div>
  );
}
