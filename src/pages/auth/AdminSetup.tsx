import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ADMIN_MODULES, type AdminModuleKey } from '../../permissions';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  ClipboardList,
  Users,
  MapPin,
  Globe,
  UploadCloud,
  Building2,
  Home,
  LogIn,
  Sparkles,
} from 'lucide-react';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  staging: <UploadCloud size={20} />,
  'entity-zone-assign': <MapPin size={20} />,
  'entity-manage': <Building2 size={20} />,
  'person-assign': <Users size={20} />,
  'person-manage': <Users size={20} />,
  'non-entity-zone-assign': <Home size={20} />,
  'non-entity-manage': <Home size={20} />,
  'dct-entity': <Users size={20} />,
  'dct-non-entity': <Users size={20} />,
  geography: <MapPin size={20} />,
  'site-zone-assign': <Globe size={20} />,
  'data-upload': <UploadCloud size={20} />,
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  core: { label: 'Core Operations', icon: <ClipboardList size={16} /> },
  entity: { label: 'Entity Management', icon: <Building2 size={16} /> },
  person: { label: 'Person Management', icon: <Users size={16} /> },
  nonentity: { label: 'Non-Entity Management', icon: <Home size={16} /> },
  dct: { label: 'DCT Classification', icon: <Users size={16} /> },
  geo: { label: 'Geography', icon: <MapPin size={16} /> },
  site: { label: 'Site Management', icon: <Globe size={16} /> },
  upload: { label: 'Data Upload', icon: <UploadCloud size={16} /> },
};

const CATEGORY_COLORS: Record<string, string> = {
  core: 'var(--color-brand-600)',
  entity: 'var(--color-entity-600)',
  person: 'var(--color-person-600)',
  nonentity: 'var(--color-physicalasset-600)',
  dct: 'var(--color-dct-600)',
  geo: 'var(--color-geo-600)',
  site: 'var(--color-site-600)',
  upload: 'var(--color-upload-600)',
};

export default function AdminSetup() {
  const { user, loading, isMasterAdmin, setUserRole, setAssignedModules, assignedModules } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AdminModuleKey[]>(() => {
    return assignedModules.filter((m) => ADMIN_MODULES.some((mod) => mod.key === m));
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setSelected(assignedModules.filter((m) => ADMIN_MODULES.some((mod) => mod.key === m)));
  }, [assignedModules]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" style={{ background: 'linear-gradient(135deg, var(--color-brand-50) 0%, var(--color-surface-100) 50%, var(--color-brand-100) 100%)' }}>
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
        <div className="text-surface-500 text-sm">Loading your workspace...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleModule = (key: AdminModuleKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleRoleChange = (role: 'admin' | 'master-admin') => {
    setUserRole(role);
    if (role === 'master-admin') {
      setSelected([]);
    }
  };

  const handleSubmit = async () => {
    if (!isMasterAdmin && selected.length === 0) {
      setError('Please select at least one module to enable.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const role = isMasterAdmin ? 'master-admin' : 'admin';
      setUserRole(role);
      if (!isMasterAdmin) {
        setAssignedModules(selected);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedModules = ADMIN_MODULES.reduce((acc, mod) => {
    if (!acc[mod.category]) acc[mod.category] = [];
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, typeof ADMIN_MODULES>);

  const categoryLabels: Record<string, string> = {
    core: 'Core Operations',
    entity: 'Entity Management',
    person: 'Person Management',
    nonentity: 'Non-Entity Management',
    dct: 'DCT Classification',
    geo: 'Geography',
    site: 'Site Management',
    upload: 'Data Upload',
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(135deg, var(--color-brand-50) 0%, var(--color-surface-100) 50%, var(--color-brand-100) 100%)' }}>
      <header className="bg-white/80 backdrop-blur-sm border-b border-surface-200 shadow-sm sticky top-0 z-40">
        <div className="container-fluid px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-600 text-white rounded-xl shadow-md">
              <Workflow size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-surface-900 font-display">
                Tamil Nadu & Puducherry
              </h1>
              <p className="text-xs text-surface-500 font-medium">
                L1 Identity Registry Console
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-surface-600 hidden sm:inline font-medium">{user?.email}</span>
            <div className="px-3 py-1 rounded-full text-xs font-semibold shadow-inner" style={{ backgroundColor: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>
              {isMasterAdmin ? 'Master Admin' : 'Restricted Admin'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4">
        <div className="container-fluid space-y-8">
          <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-brand-100)' }}>
                <Shield size={24} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-brand-800 flex items-center space-x-2">
                  <span>Permission Area</span>
                  <Sparkles size={16} className="text-brand-500" />
                </h3>
                <p className="text-sm text-brand-700 mt-2 leading-relaxed">
                  Every administrator must declare module access before using the console.
                  Master Admin has full access to all modules. Restricted administrators
                  will only be able to access explicitly granted modules.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-surface-900 flex items-center space-x-2">
                <ClipboardList size={20} className="text-surface-500" />
                <span>Admin Role Declaration</span>
              </h2>
              <p className="text-sm text-surface-500 mt-1">
                Select your administrative level. This determines your default module access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange('master-admin')}
                className={`relative px-5 py-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  isMasterAdmin
                    ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-200/50'
                    : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                }`}
              >
                {isMasterAdmin && (
                  <div className="absolute top-4 right-4">
                    <div className="p-1 bg-brand-100 rounded-full">
                      <CheckCircle2 size={16} className="text-brand-600" />
                    </div>
                  </div>
                )}
                <div className="text-base font-semibold text-surface-900 mb-1">Master Admin</div>
                <div className="text-sm text-surface-500">
                  Full access to all modules with no restrictions.
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`relative px-5 py-5 rounded-xl border-2 text-left transition-all duration-200 ${
                  !isMasterAdmin
                    ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-200/50'
                    : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                }`}
              >
                {isMasterAdmin === false && (
                  <div className="absolute top-4 right-4">
                    <div className="p-1 bg-brand-100 rounded-full">
                      <CheckCircle2 size={16} className="text-brand-600" />
                    </div>
                  </div>
                )}
                <div className="text-base font-semibold text-surface-900 mb-1">Restricted Admin</div>
                <div className="text-sm text-surface-500">
                  Select specific modules for this administrator.
                </div>
              </button>
            </div>
          </div>

          {!isMasterAdmin && (
            <div className="bg-white border border-surface-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-surface-200 bg-surface-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-surface-900 flex items-center space-x-2">
                      <ClipboardList size={20} className="text-surface-500" />
                      <span>Module Access Configuration</span>
                    </h2>
                    <p className="text-sm text-surface-500 mt-1">
                      Select the modules this administrator is allowed to access.
                    </p>
                  </div>
                  <div className="text-right text-xs text-surface-500">
                    <div className="font-semibold text-surface-700">{selected.length} selected</div>
                    <div>of {ADMIN_MODULES.length} modules</div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {Object.entries(groupedModules).map(([category, modules]) => {
                  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.core;
                  const config = CATEGORY_CONFIG[category];
                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                          {config?.icon || <ClipboardList size={16} />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-sm font-semibold uppercase tracking-wide" style={{ color }}>{config?.label || category}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((mod) => {
                          const checked = selected.includes(mod.key);
                          return (
                            <button
                              key={mod.key}
                              type="button"
                              onClick={() => toggleModule(mod.key)}
                              className={`group flex items-start space-x-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                checked
                                  ? 'border-brand-500 bg-brand-50 shadow-md'
                                  : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                              }`}
                            >
                              <div className={`mt-0.5 flex-shrink-0 transition-colors ${
                                checked ? 'text-brand-600' : 'text-surface-400 group-hover:text-surface-600'
                              }`}>
                                {MODULE_ICONS[mod.key] || <ClipboardList size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-surface-900 flex items-center space-x-2">
                                  <span className="truncate">{mod.label}</span>
                                  {checked && (
                                    <CheckCircle2 size={14} className="text-brand-600 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="text-xs text-surface-500 mt-1 line-clamp-2">{mod.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-all duration-200"
              disabled={submitting}
            >
              Back to Login
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 text-sm font-semibold shadow-lg shadow-brand-200/50 disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? (
                <>
                  <LogIn size={14} className="animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <span>Save & Continue to Dashboard</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}