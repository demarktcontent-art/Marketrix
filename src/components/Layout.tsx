import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Megaphone, Menu, X, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store';
import { toast } from 'sonner';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Content Plan', href: '/content', icon: FileText },
  { name: 'Ads Plan', href: '/ads', icon: Megaphone },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { companySettings, userProfile, logout } = useStore();

  const filteredNavItems = navItems.filter(item => {
    if (item.name === 'Content Plan' && userProfile?.role === 'Ads Manager') return false;
    if (item.name === 'Ads Plan' && userProfile?.role === 'Content Manager') return false;
    return true;
  });

  const handleSignOut = async () => {
    try {
      logout();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
          {companySettings.logoUrl && (
            <img src={companySettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
          )}
          <h1 className="text-xl font-bold text-gray-900">{companySettings.name || 'MarketPlan'}</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-800/50 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-20 w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {companySettings.logoUrl && (
              <img src={companySettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
            )}
            <h1 className="text-xl font-bold text-gray-900">{companySettings.name || 'MarketPlan'}</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userProfile?.name}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 pt-16 md:pt-0">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
