/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  MapPin,
  Globe,
  UploadCloud,
  Menu,
  X,
  LogOut,
  Workflow,
  Building2,
  Home,
  FolderTree,
  Users,
  Share2,
  ChevronLeft,
  Bell,
  Settings,
  Command,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTE_REQUIRED_MODULES } from '../permissions';
import ErrorBoundary from '../components/ErrorBoundary';

const ROUTE_THEME: Record<string, string> = {
  '/entity': 'entity',
  '/person': 'person',
  '/non-entity': 'physicalasset',
  '/dct': 'dct',
  '/data-upload': 'upload',
  '/staging': 'upload',
  '/geography': 'geo',
  '/sites': 'site',
};

function getTheme(pathname: string) {
  for (const [prefix, theme] of Object.entries(ROUTE_THEME)) {
    if (pathname.startsWith(prefix)) return theme;
  }
  return 'brand';
}

function getThemeGradient(theme: string) {
  const map: Record<string, string> = {
    brand: 'from-brand-600 to-brand-700',
    entity: 'from-orange-500 to-amber-600',
    person: 'from-purple-500 to-violet-600',
    nonentity: 'from-blue-500 to-indigo-600',
    dct: 'from-emerald-500 to-teal-600',
    upload: 'from-violet-500 to-purple-600',
    geo: 'from-teal-500 to-cyan-600',
    site: 'from-rose-500 to-pink-600',
  };
  return map[theme] || map.brand;
}

export default function MainLayout() {
  const { user, logOut, isMasterAdmin, hasModule } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = getTheme(location.pathname);
  const gradient = getThemeGradient(theme);

  const tc = (t: string, shade: '50' | '100' | '200' | '300' | '500' | '600' | '700') =>
    `var(--color-${t}-${shade})`;

  const navItems = [
    { path: '/dashboard', icon: Layers, label: 'Dashboard', theme: 'brand', shortcut: '⌘D' },
    { path: '/staging', icon: UploadCloud, label: 'Staging', theme: 'upload', shortcut: '⌘S' },
    { path: '/data-upload', icon: Share2, label: 'Data Upload', theme: 'upload', shortcut: '⌘U' },
    { path: '/entity-assign', icon: Building2, label: 'Entity Assignment', theme: 'entity', shortcut: '⌘E' },
    { path: '/entity-manage', icon: Building2, label: 'Entity Management', theme: 'entity', shortcut: null },
    { path: '/person-assign', icon: Users, label: 'Person Assignment', theme: 'person', shortcut: null },
    { path: '/person-manage', icon: Users, label: 'Person Management', theme: 'person', shortcut: null },
    { path: '/non-entity-assign', icon: Home, label: 'Non-Entity Assignment', theme: 'nonentity', shortcut: '⌘N' },
    { path: '/non-entity-manage', icon: Home, label: 'Non-Entity Management', theme: 'nonentity', shortcut: null },
    { path: '/dct-entity', icon: Users, label: 'DCT Entity Admin', theme: 'dct', shortcut: null },
    { path: '/dct-non-entity', icon: Building2, label: 'DCT Non-Entity', theme: 'dct', shortcut: null },
    { path: '/geography', icon: MapPin, label: 'Geography', theme: 'geo', shortcut: '⌘G' },
    { path: '/sites', icon: Globe, label: 'Sites', theme: 'site', shortcut: '⌘P' },
  ];

  function isRouteVisible(path: string): boolean {
    if (isMasterAdmin) return true;
    const required = ROUTE_REQUIRED_MODULES[path];
    if (!required) return true;
    return hasModule(required);
  }

  const visibleNavItems = navItems.filter(item => isRouteVisible(item.path));

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (email?: string | null) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-100 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-surface-200/80 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
              <Workflow size={20} className="drop-shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-extrabold tracking-tight text-surface-900 font-display leading-tight">
                TN & Puducherry
              </h1>
              <p className="text-[11px] text-surface-500 font-semibold tracking-wide uppercase">
                L1 Registry Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="hidden md:flex p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-all"
              title="Notifications"
            >
              <Bell size={18} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-surface-600 bg-surface-100 border border-surface-200 rounded-lg hover:bg-surface-200 transition-colors"
            >
              <Command size={14} />
              <span>Dashboard</span>
            </button>
            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-surface-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${gradient} shadow-sm`}>
                {getInitials(user?.email)}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-surface-800 truncate max-w-[140px]">{user?.email}</p>
                <p className="text-surface-400 font-medium">{isMasterAdmin ? 'Master Admin' : 'Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all text-xs font-bold shadow-sm"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 bg-white/95 backdrop-blur-sm animate-fade-in">
            <nav className="px-3 py-3 space-y-1">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? tc(item.theme, '50') : undefined,
                    color: isActive ? tc(item.theme, '700') : undefined,
                    border: isActive ? `1px solid ${tc(item.theme, '200')}` : undefined,
                  })}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                      isActive ? 'font-bold' : ''
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-surface-200 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-2.5 text-xs text-surface-500">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${gradient}`}>
                    {getInitials(user?.email)}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-700 truncate max-w-[180px]">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all text-sm font-semibold"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col bg-white border-r border-surface-200 sticky top-16 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'}`} style={{ height: 'calc(100vh - 64px)' }}>
          <nav className="p-3 space-y-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? tc(item.theme, '50') : undefined,
                    color: isActive ? tc(item.theme, '700') : undefined,
                    borderColor: isActive ? tc(item.theme, '200') : undefined,
                    boxShadow: isActive ? `0 1px 3px rgb(0 0 0 / 0.04)` : undefined,
                  })}
                  className={({ isActive }) =>
                    `group flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2.5 rounded-xl transition-all duration-150 text-sm relative ${
                      isActive ? 'font-bold border' : 'font-medium text-surface-500 hover:text-surface-800 hover:bg-surface-50 border border-transparent'
                    } ${sidebarCollapsed ? 'px-0 py-3' : ''}`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-${item.theme}-500`} />
                      )}
                      <Icon size={sidebarCollapsed ? 22 : 19} className={`${isActive ? '' : 'group-hover:scale-110 transition-transform duration-150'}`} />
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="block truncate">{item.label}</span>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="mt-auto p-3 border-t border-surface-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} className={sidebarCollapsed ? '' : 'rotate-180'} />
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-surface-100 overflow-auto min-h-0">
          <div className={`container-fluid section page-stripe-${theme} animate-fade-in`}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
