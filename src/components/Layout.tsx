import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Megaphone, Menu, X, Settings as SettingsIcon, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const { companySettings, userProfile, logout } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.name === 'Products' && !(userProfile?.permissions?.canManageProducts ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Ads Manager'))) return false;
    if (item.name === 'Content Plan' && !(userProfile?.permissions?.canManageContent ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Content Manager'))) return false;
    if (item.name === 'Ads Plan' && !(userProfile?.permissions?.canManageAds ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Ads Manager'))) return false;
    if (item.name === 'Settings' && !(userProfile?.permissions?.canManageUsers || userProfile?.permissions?.canEditSettings || userProfile?.role === 'Admin')) return false;
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

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-1", mobile ? "px-4 py-6" : "px-3 py-4")}>
      {filteredNavItems.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
              isSidebarCollapsed && !mobile && 'justify-center px-2'
            )}
            title={isSidebarCollapsed && !mobile ? item.name : undefined}
          >
            <item.icon
              className={cn(
                'h-5 w-5 shrink-0',
                isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
                !isSidebarCollapsed || mobile ? 'mr-3' : ''
              )}
            />
            {(!isSidebarCollapsed || mobile) && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden md:flex md:flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <NavContent />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
          <div className={cn("flex items-center gap-3", isSidebarCollapsed ? "flex-col" : "justify-between")}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <UserIcon className="h-5 w-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{userProfile?.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{userProfile?.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className={cn(
                "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors",
                isSidebarCollapsed && "mt-2"
              )}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 shrink-0 z-20">
          {/* Left: Menu Button */}
          <div className="flex-1 flex items-center">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Middle: Company Name */}
          <div className="flex-none flex justify-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
            >
              {companySettings.logoUrl && (
                <img src={companySettings.logoUrl} alt="Logo" className="h-6 w-auto object-contain rounded-sm" />
              )}
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">
                {companySettings.name || 'MarketPlan'}
              </h1>
            </Link>
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex-1 flex justify-end items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-red-500" title="Dark Mode Test (Blue=Light, Red=Dark)" />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest hidden sm:inline">
              {theme} mode
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        <div className={cn(
          "md:hidden fixed inset-0 bg-gray-800/50 z-40 transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )} onClick={() => setIsMobileMenuOpen(false)} />
        
        <div className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="font-bold text-gray-900 dark:text-gray-100">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavContent mobile />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{userProfile?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile?.role}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
