import { LayoutDashboard, Package, Layers, ScanLine, Bell, Settings, LogOut, Sprout } from 'lucide-react';
import { User } from '../../types';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User;
  onSignOut: () => void;
}

export function AppSidebar({ currentPage, onNavigate, user, onSignOut }: AppSidebarProps) {
  // Different menu items based on user role
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'beds', label: 'Plant Beds', icon: Layers },
    { id: 'qr', label: 'QR Codes', icon: ScanLine },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const fieldWorkerMenuItems = [
    { id: 'dashboard', label: 'My Beds', icon: LayoutDashboard },
    { id: 'scanning', label: 'Scan QR Code', icon: ScanLine },
  ];

  const menuItems = user.role === 'field_worker' ? fieldWorkerMenuItems : adminMenuItems;

  return (
    <div className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <img src="/Smartseed.png" alt="Smartseed Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl">Smartseed</h1>
            <p className="text-xs text-sidebar-foreground/70">Nursery Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 px-4 py-2">
          <p className="truncate">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
