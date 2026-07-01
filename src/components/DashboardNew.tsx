/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Layers,
  MapPin,
  Globe,
  Database,
  ChevronRight,
  Server,
  Building2,
  Home,
  FolderTree,
  ChevronDown,
  Activity,
  Users,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Upload,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEntityDomains, getAllNonEntityDomains } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { entityApi, nonEntityApi, siteApi, personApi, geoApi } from "../services/api";
import { ActiveEntity, NonEntity, SetSite, Person, DCTChangeRecord } from "../types";

export default function DashboardNew() {
  const navigate = useNavigate();
  const {
    zoneRefs,
    sites,
    activeEntities: ctxActiveEntities,
    nonEntities: ctxNonEntities,
    persons: ctxPersons,
    dctChanges,
    getStagingEntities,
    getStagingNonEntities,
  } = useData();

  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [fbNonEntities, setFbNonEntities] = useState<NonEntity[]>([]);
  const [fbPersons, setFbPersons] = useState<Person[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);

  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    try {
      const [entities, nonEntities, persons] = await Promise.all([
        entityApi.getAll(),
        nonEntityApi.getAll(),
        personApi.getAll(),
      ]);
      setFbEntities(entities);
      setFbNonEntities(nonEntities);
      setFbPersons(persons);
    } catch (err) {
      console.error('Failed to load dashboard data from Firestore:', String(err).replace(/[\r\n]/g, ' '));
    } finally {
      setIsLoadingFb(false);
    }
  };

  useEffect(() => {
    loadFromFirestore();
  }, []);

  const activeEntities = fbEntities.length > 0 ? fbEntities : ctxActiveEntities;
  const nonEntities = fbNonEntities.length > 0 ? fbNonEntities : ctxNonEntities;
  const persons = fbPersons.length > 0 ? fbPersons : ctxPersons;

  const entityDomains = getAllEntityDomains();
  const nonEntityDomains = getAllNonEntityDomains();

  const activeEntityCount = activeEntities.filter((e) => e.status === "active").length;
  const activeNonEntityCount = nonEntities.filter((n) => n.status === "active").length;
  const pendingEntityCount = getStagingEntities().filter((e) => e.status === "pending").length;
  const pendingNonEntityCount = getStagingNonEntities().filter((ne) => ne.status === "pending").length;
  const totalZones = zoneRefs.length;
  const activeSites = sites.filter(s => s.status === 'active').length;
  const totalPersons = persons.length;
  const stoppedEntities = activeEntities.filter(e => e.status === 'stopped').length;
  const stoppedNonEntities = nonEntities.filter(n => n.status === 'stopped').length;

  const recentChanges = dctChanges.slice(0, 10);

  const domainDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    activeEntities.forEach(e => {
      counts[e.primary_domain] = (counts[e.primary_domain] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [activeEntities]);

  const domainLabel = (code: string) => {
    const d = entityDomains.find((x) => x.code === code);
    return d ? d.name : code;
  };

  return (
    <div className="space-y-6">
      {/* Hero / Welcome card */}
      <div className="relative bg-white rounded-2xl p-6 md:p-8 border border-neutral-200 shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neutral-100 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
              <ShieldCheck size={13} />
              Layer 1 Core Console
            </span>
            <button
              onClick={loadFromFirestore}
              disabled={isLoadingFb}
              className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-neutral-200"
              title="Refresh from Firebase"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingFb ? 'animate-spin text-primary-500' : ''}`} />
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-neutral-900 leading-tight">
            Tamil Nadu & Puducherry
            <br />
            <span className="text-primary-700">L1 Identity Registry</span>
          </h1>
          <p className="text-neutral-600 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
            Unified administrative database of physical settlement zones, smart district registries, dynamic multi-tenant portals, and verified credential management for Tamil Nadu, Puducherry (UT), and surrounding Tamil-speaking zones.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => navigate('/staging')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/25 transition-all active:scale-[0.97]"
            >
              + New Entry
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => navigate('/entity-registry')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
            >
              View Registry
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Physical Zones"
          value={totalZones}
          icon={<Layers size={20} />}
          color="indigo"
          linkText="View"
          onLink={() => navigate("/geography")}
          helper="Address lookup system"
          trend="+12% from last month"
        />
        <KPICard
          title="Provisioned Sites"
          value={activeSites}
          icon={<Globe size={20} />}
          color="blue"
          linkText="Manage"
          onLink={() => navigate("/sites")}
          helper="Multi-tenant portals"
          trend="+5% from last week"
        />
        <KPICard
          title="Active Entities"
          value={activeEntityCount}
          icon={<Building2 size={20} />}
          color="purple"
          linkText="Registry"
          onLink={() => navigate("/entity-manage")}
          helper="Service providers"
          trend={activeEntityCount > 0 ? "+8% growth" : "No data"}
        />
        <KPICard
          title="Non-Entities"
          value={activeNonEntityCount}
          icon={<Home size={20} />}
          color="emerald"
          linkText="Registry"
          onLink={() => navigate("/non-entity-manage")}
          helper="Physical assets"
          trend={activeNonEntityCount > 0 ? "+15% growth" : "No data"}
        />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Reviews"
          value={pendingEntityCount + pendingNonEntityCount}
          icon={<Activity className="w-5 h-5 text-amber-600" />}
          accent="amber"
          action="Review Staging"
          onAction={() => navigate("/staging")}
          subtitle="Entities awaiting approval"
        />
        <MetricCard
          title="Total Persons"
          value={totalPersons}
          icon={              <Users className="w-5 h-5 text-primary-600" />}
          accent="indigo"
          action="Manage Persons"
          onAction={() => navigate("/person-manage")}
          subtitle="Linked entity relationships"
        />
        <MetricCard
          title="Stopped Records"
          value={stoppedEntities + stoppedNonEntities}
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          accent="rose"
          action="View Archives"
          onAction={() => navigate("/dct")}
          subtitle="Items in archive"
        />
      </div>

      {/* Domain Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomainDistributionPanel
          title="Entity Domain Distribution"
          data={domainDistribution}
          labelFn={domainLabel}
          onViewAll={() => navigate("/entity-registry")}
        />
        
        <RecentActivityPanel
          changes={recentChanges}
          onNavigate={navigate}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsPanel />

      {/* Admin Guidance */}
      <AdminGuidancePanel />
    </div>
  );
}

function KPICard({
  title,
  value,
  icon,
  color,
  linkText,
  onLink,
  helper,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "purple" | "emerald";
  linkText: string;
  onLink: () => void;
  helper: string;
  trend?: string;
}) {
  const palette: Record<string, { border: string; iconBg: string; text: string; bg: string }> = {
    indigo: { border: "border-indigo-200", iconBg: "bg-indigo-100", text: "text-indigo-700", bg: "bg-indigo-50/50" },
    blue: { border: "border-blue-200", iconBg: "bg-blue-100", text: "text-blue-700", bg: "bg-blue-50/60" },
    purple: { border: "border-purple-200", iconBg: "bg-purple-100", text: "text-purple-700", bg: "bg-purple-50/50" },
    emerald: { border: "border-emerald-200", iconBg: "bg-emerald-100", text: "text-emerald-700", bg: "bg-emerald-50/60" },
  };
  const c = palette[color];
  return (
    <button
      onClick={onLink}
      className={`w-full text-left p-5 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 group active:scale-[0.98]`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-[11px] ${c.text} uppercase tracking-widest font-extrabold font-mono`}>{title}</p>
          <h4 className="text-3xl font-extrabold font-display mt-2 text-neutral-900 tracking-tight">{value}</h4>
        </div>
        <span className={`p-2.5 ${c.iconBg} rounded-xl ${c.text} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>{icon}</span>
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-200/80 space-y-2">
        <span className="text-neutral-500 font-semibold text-xs">{helper}</span>
        {trend && (
          <span className={`text-xs ${c.text} font-medium inline-flex items-center gap-1`}>
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
    </button>
  );
}

function MetricCard({
  title,
  value,
  icon,
  accent,
  action,
  onAction,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "amber" | "orange" | "indigo" | "rose" | "emerald";
  action: string;
  onAction: () => void;
  subtitle?: string;
}) {
  const accentClasses: Record<string, { bg: string; border: string; text: string; btnBg: string }> = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", btnBg: "bg-white/70 hover:bg-white" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", btnBg: "bg-white/70 hover:bg-white" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800", btnBg: "bg-white/70 hover:bg-white" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", btnBg: "bg-white/70 hover:bg-white" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", btnBg: "bg-white/70 hover:bg-white" },
  };
  const a = accentClasses[accent];
  return (
    <div className={`rounded-2xl border ${a.border} ${a.bg} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-70">{title}</p>
            <p className="text-3xl font-extrabold font-display tracking-tight">{value}</p>
             {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <button
          onClick={onAction}
          className={`px-4 py-2 rounded-xl border ${a.btnBg} ${a.text} text-xs font-extrabold shadow-sm hover:shadow transition-all active:scale-95`}
        >
          {action}
        </button>
      </div>
    </div>
  );
}

function DomainDistributionPanel({
  title,
  data,
  labelFn,
  onViewAll,
}: {
  title: string;
  data: [string, number][];
  labelFn: (code: string) => string;
  onViewAll: () => void;
}) {
  const maxValue = data.length > 0 ? Math.max(...data.map(([, v]) => v)) : 1;
  const total = data.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-100 text-primary-700 rounded-xl">
          <PieChart className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight font-display">
          {title}
        </h3>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 space-y-2">
          <PieChart className="w-12 h-12 mx-auto opacity-30" />
          <p className="font-medium text-neutral-600">No domain data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(([domain, count]) => (
            <div key={domain} className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-neutral-800">{labelFn(domain)}</span>
                <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">
                  {count} ({((count / total) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={onViewAll}
             className="w-full mt-4 py-2.5 text-primary-600 bg-primary-50 border border-primary-200 rounded-xl text-sm font-bold transition-all hover:shadow-sm active:scale-[0.99]"
          >
            View Full Registry →
          </button>
        </div>
      )}
    </div>
  );
}

function RecentActivityPanel({
  changes,
  onNavigate,
}: {
  changes: DCTChangeRecord[];
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight font-display">
          Recent DCT Changes
        </h3>
      </div>

      {changes.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 space-y-2">
          <Activity className="w-12 h-12 mx-auto opacity-30" />
          <p className="font-medium text-neutral-600">No recent changes</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {changes.map((change) => (
            <div key={change.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg border border-surface-200">
              <div className="flex-shrink-0">
                {change.action === 'edit' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : change.action === 'delete' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Activity className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {change.action.toUpperCase()} - {change.dctType}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  "{change.oldValue}" → "{change.newValue}"
                </p>
              </div>
              <div className="text-xs text-neutral-400">
                {new Date(change.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActionsPanel() {
  const navigate = useNavigate();
  const actions = [
    { label: 'Upload CSV', icon: <Upload className="w-4 h-4" />, path: '/data-upload/entity' },
    { label: 'Manage Zones', icon: <MapPin className="w-4 h-4" />, path: '/geography' },
    { label: 'DCT Taxonomy', icon: <FolderTree className="w-4 h-4" />, path: '/dct' },
    { label: 'Person System', icon: <Users className="w-4 h-4" />, path: '/person-assign' },
    { label: 'Schedule Export', icon: <Calendar className="w-4 h-4" />, path: '/data-upload' },
    { label: 'View Archives', icon: <Database className="w-4 h-4" />, path: '/dct' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight font-display">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all active:scale-[0.97]"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {action.icon}
            </div>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminGuidancePanel() {
  const guidanceItems = [
    {
      title: 'Staging Workflow',
      desc: 'Create entities/non-entities → Review → Assign to registry → Live in hierarchy',
      step: 1,
    },
    {
      title: 'Data Export (L1→L2)',
      desc: 'Push data to next layer via JSON files. Schedule cron jobs for automation.',
      step: 2,
    },
    {
      title: 'DCT Management',
      desc: 'Manage domain/category/type hierarchy. Use split/convert/merge for restructuring.',
      step: 3,
    },
    {
      title: 'Geographic Zones',
      desc: '7-layer physical zone system: State → District → Taluk → City/Village → Area → Street → Substreet',
      step: 4,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-2xl p-6">
      <h3 className="text-lg font-extrabold text-neutral-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <ShieldCheck className="w-5 h-5" />
        Admin Guidance
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {guidanceItems.map((item) => (
          <div key={item.step} className="bg-white/80 rounded-xl p-4 border border-primary-200">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-extrabold text-sm mb-3 shadow">
              {item.step}
            </div>
            <h4 className="font-extrabold text-sm text-neutral-900 mb-1.5 tracking-tight">
              {item.title}
            </h4>
            <p className="text-xs text-neutral-700 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}