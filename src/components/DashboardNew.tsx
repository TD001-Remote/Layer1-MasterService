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
  Network,
  Building2,
  Home,
  FolderTree,
  ChevronDown,
  Activity,
  Users,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEntityDomains, getAllNonEntityDomains } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { entityApi, nonEntityApi, siteApi } from "../services/api";
import { ActiveEntity, NonEntity, SetSite } from "../types";

export default function DashboardNew() {
  const navigate = useNavigate();
  const {
    zoneRefs,
    sites,
    activeEntities: ctxActiveEntities,
    nonEntities: ctxNonEntities,
    getStagingEntities,
    getStagingNonEntities,
  } = useData();

  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [fbNonEntities, setFbNonEntities] = useState<NonEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);

  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    try {
      const [entities, nonEntities] = await Promise.all([
        entityApi.getAll(),
        nonEntityApi.getAll(),
      ]);
      setFbEntities(entities);
      setFbNonEntities(nonEntities);
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

  const entityDomains = getAllEntityDomains();
  const nonEntityDomains = getAllNonEntityDomains();

  const activeEntityCount = activeEntities.filter((e) => e.status === "active").length;
  const activeNonEntityCount = nonEntities.filter((n) => n.status === "active").length;
  const pendingEntityCount = getStagingEntities().filter((e) => e.status === "pending").length;
  const pendingNonEntityCount = getStagingNonEntities().filter((ne) => ne.status === "pending").length;
  const totalZones = zoneRefs.length;
  const activeSites = sites.length;

  const [expandedEntityDomains, setExpandedEntityDomains] = useState<Set<string>>(new Set());
  const [expandedNonEntityDomains, setExpandedNonEntityDomains] = useState<Set<string>>(new Set());

  const toggleDomain = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, code: string) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const entityTree = useMemo(() => {
    const map = new Map<string, { domain: string; categories: Set<string>; count: number }>();
    activeEntities
      .filter((e) => e.status === "active")
      .forEach((e) => {
        const key = e.primary_domain || "UNKNOWN";
        if (!map.has(key)) map.set(key, { domain: key, categories: new Set(), count: 0 });
        const entry = map.get(key)!;
        entry.categories.add(e.category_pk || "Uncategorized");
        entry.count += 1;
      });
    return Array.from(map.values());
  }, [activeEntities]);

  const nonEntityTree = useMemo(() => {
    const map = new Map<string, { domain: string; categories: Set<string>; count: number }>();
    nonEntities
      .filter((n) => n.status === "active")
      .forEach((n) => {
        const key = n.primary_domain || "UNKNOWN";
        if (!map.has(key)) map.set(key, { domain: key, categories: new Set(), count: 0 });
        const entry = map.get(key)!;
        entry.categories.add(n.category_pk || "Uncategorized");
        entry.count += 1;
      });
    return Array.from(map.values());
  }, [nonEntities]);

  const domainLabel = (code: string) => {
    const d = entityDomains.find((x) => x.code === code);
    return d ? d.name : code;
  };
  const nonDomainLabel = (code: string) => {
    const d = nonEntityDomains.find((x) => x.code === code);
    return d ? d.name : code;
  };

  return (
    <div className="space-y-6">
      {/* Hero / Welcome card */}
      <div className="relative bg-white rounded-2xl p-6 md:p-8 border border-surface-200 shadow-lg overflow-hidden">
        {/* Decorative background watermark */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/80 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-surface-100 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
              <ShieldCheck size={13} />
              Layer 1 Core Console
            </span>
            <button
              onClick={loadFromFirestore}
              disabled={isLoadingFb}
              className="p-2 text-surface-500 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-surface-200"
              title="Refresh from Firebase"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingFb ? 'animate-spin text-brand-500' : ''}`} />
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-surface-900 leading-tight">
            Tamil Nadu & Puducherry
            <br />
            <span className="text-brand-700">L1 Identity Registry</span>
          </h1>
          <p className="text-surface-600 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
            Unified administrative database of physical settlement zones, smart district registries, dynamic multi-tenant portals, and verified credential management for Tamil Nadu, Puducherry (UT), and surrounding Tamil-speaking zones.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => navigate('/staging')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all active:scale-[0.97]"
            >
              + New Entry
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => navigate('/entity-registry')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-surface-700 border border-surface-200 hover:border-surface-300 hover:bg-surface-50 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
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
        />
        <KPICard
          title="Provisioned Sites"
          value={activeSites}
          icon={<Globe size={20} />}
          color="blue"
          linkText="Manage"
          onLink={() => navigate("/sites")}
          helper="Multi-tenant portals"
        />
        <KPICard
          title="Active Entities"
          value={activeEntityCount}
          icon={<Building2 size={20} />}
          color="purple"
          linkText="Registry"
          onLink={() => navigate("/entity-manage")}
          helper="Service providers"
        />
        <KPICard
          title="Non-Entities"
          value={activeNonEntityCount}
          icon={<Home size={20} />}
          color="emerald"
          linkText="Registry"
          onLink={() => navigate("/non-entity-manage")}
          helper="Physical assets"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Entity Review"
          value={pendingEntityCount}
          icon={<Activity className="w-5 h-5 text-amber-600" />}
          accent="amber"
          action="Review Staging"
          onAction={() => navigate("/staging")}
        />
        <MetricCard
          title="Pending Non-Entity Review"
          value={pendingNonEntityCount}
          icon={<MapPin className="w-5 h-5 text-orange-600" />}
          accent="orange"
          action="Review Staging"
          onAction={() => navigate("/staging")}
        />
        <MetricCard
          title="Total Registered"
          value={activeEntityCount + activeNonEntityCount}
          icon={<Users className="w-5 h-5 text-brand-600" />}
          accent="indigo"
          action="View All"
          onAction={() => navigate("/entity-registry")}
        />
      </div>

      {/* Tree Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreePanel
          title="Entity Registry Tree"
          subtitle="Service providers organized by domain → category"
          icon={<Building2 className="w-5 h-5" />}
          gradient="from-brand-600 to-purple-600"
          items={entityTree}
          expanded={expandedEntityDomains}
          onToggle={(code) => toggleDomain(setExpandedEntityDomains, code)}
          labelFn={domainLabel}
          emptyIcon={<Database className="w-12 h-12 mx-auto mb-3 opacity-40" />}
          emptyTitle="No entities yet"
          emptySub="Create entities in Staging Area"
          emptyCta="Go to Staging"
          onEmptyCta={() => navigate("/staging")}
          viewAllLabel="View Full Entity Registry"
          onViewAll={() => navigate("/entity-registry")}
          accentBg="bg-brand-50"
          accentBorder="border-brand-200"
          accentText="text-brand-600"
          accentHoverBg="hover:bg-brand-50"
          accentHoverBorder="border-brand-200"
        />

        <TreePanel
          title="Non-Entity Registry Tree"
          subtitle="Physical assets organized by domain → category"
          icon={<Home className="w-5 h-5" />}
          gradient="from-emerald-600 to-teal-600"
          items={nonEntityTree}
          expanded={expandedNonEntityDomains}
          onToggle={(code) => toggleDomain(setExpandedNonEntityDomains, code)}
          labelFn={nonDomainLabel}
          emptyIcon={<MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />}
          emptyTitle="No non-entities yet"
          emptySub="Create assets in Staging Area"
          emptyCta="Go to Staging"
          onEmptyCta={() => navigate("/staging")}
          viewAllLabel="View Full Non-Entity Registry"
          onViewAll={() => navigate("/non-entity-manage")}
          accentBg="bg-emerald-50"
          accentBorder="border-emerald-200"
          accentText="text-emerald-600"
          accentHoverBg="hover:bg-emerald-50"
          accentHoverBorder="border-emerald-200"
        />
      </div>

      <OverviewCard />
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "purple" | "emerald";
  linkText: string;
  onLink: () => void;
  helper: string;
}) {
  const palette: Record<string, { border: string; iconBg: string; text: string; bg: string }> = {
    indigo: { border: "border-brand-200", iconBg: "bg-brand-100", text: "text-brand-700", bg: "bg-brand-50/50" },
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
          <h4 className="text-3xl font-extrabold font-display mt-2 text-surface-900 tracking-tight">{value}</h4>
        </div>
        <span className={`p-2.5 ${c.iconBg} rounded-xl ${c.text} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>{icon}</span>
      </div>
      <div className="mt-4 pt-3 border-t border-surface-200/80 flex justify-between items-center text-xs">
        <span className="text-surface-500 font-semibold">{helper}</span>
        <span className={`${c.text} font-extrabold inline-flex items-center gap-0.5 group-hover:gap-1 transition-all`}>
          {linkText} <ChevronRight size={13} />
        </span>
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: "amber" | "orange" | "indigo";
  action: string;
  onAction: () => void;
}) {
  const accentClasses: Record<string, { bg: string; border: string; text: string; btnBg: string }> = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", btnBg: "bg-white/70 hover:bg-white" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", btnBg: "bg-white/70 hover:bg-white" },
    indigo: { bg: "bg-brand-50", border: "border-brand-200", text: "text-brand-800", btnBg: "bg-white/70 hover:bg-white" },
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

function TreePanel({
  title,
  subtitle,
  icon,
  gradient,
  items,
  expanded,
  onToggle,
  labelFn,
  emptyIcon,
  emptyTitle,
  emptySub,
  emptyCta,
  onEmptyCta,
  viewAllLabel,
  onViewAll,
  accentBg,
  accentBorder,
  accentText,
  accentHoverBg,
  accentHoverBorder,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  items: { domain: string; categories: Set<string>; count: number }[];
  expanded: Set<string>;
  onToggle: (code: string) => void;
  labelFn: (code: string) => string;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptySub: string;
  emptyCta: string;
  onEmptyCta: () => void;
  viewAllLabel: string;
  onViewAll: () => void;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentHoverBg: string;
  accentHoverBorder: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-lg overflow-hidden flex flex-col">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 tracking-tight font-display">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-white/80 mt-1 font-medium">{subtitle}</p>
      </div>

      <div className="p-4 max-h-[28rem] overflow-y-auto flex-1">
        {items.length === 0 ? (
          <div className="text-center py-14 text-surface-400 space-y-2">
            {emptyIcon}
            <p className="font-bold text-surface-600">{emptyTitle}</p>
            <p className="text-sm text-surface-500 font-medium">{emptySub}</p>
            <button
              onClick={onEmptyCta}
              className="mt-3 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
            >
              {emptyCta}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const isExpanded = expanded.has(item.domain);
              return (
                <div key={item.domain} className={`border ${accentBorder} rounded-xl overflow-hidden transition-all duration-200`}>
                  <button
                    onClick={() => onToggle(item.domain)}
                    className="w-full flex items-center justify-between p-3.5 bg-surface-50 hover:bg-surface-100 transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                      <FolderTree className={`w-4 h-4 ${accentText}`} />
                      <span className="text-sm font-extrabold text-surface-900 tracking-tight">{labelFn(item.domain)}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-surface-500 bg-white px-2 py-1 rounded-lg border border-surface-200">
                      {item.count}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className={`p-3 ${accentBg} space-y-1 animate-fade-in`}>
                      {Array.from(item.categories).slice(0, 5).map((cat) => (
                        <div key={cat} className="pl-6 py-2 text-sm text-surface-700 hover:bg-white/60 rounded-lg cursor-pointer font-medium transition-colors">
                          • {cat}
                        </div>
                      ))}
                      {item.categories.size > 5 && (
                        <div className="pl-6 py-1 text-xs text-surface-500 font-semibold">
                          + {item.categories.size - 5} more categories
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={onViewAll}
              className={`w-full mt-4 py-2.5 ${accentText} ${accentHoverBg} border ${accentHoverBorder} rounded-xl text-sm font-extrabold transition-all hover:shadow-sm active:scale-[0.99]`}
            >
              {viewAllLabel} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 md:p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
          <Server size={20} />
        </div>
        <h3 className="text-lg font-extrabold text-surface-900 tracking-tight font-display">
          L1 Architecture Overview
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: 1, color: 'amber', title: 'Staging Area', desc: 'Create entities and non-entities with basic info. No geo/zone required yet. Admin reviews and approves.' },
          { step: 2, color: 'brand', title: 'Registry Assignment', desc: 'Admin assigns geo/zone to approved records and places them in hierarchical branches (domain/category/type).' },
          { step: 3, color: 'emerald', title: 'Active Registry', desc: 'Records live in hierarchical tree structure. Can be modified, moved between branches, or deactivated.' },
        ].map((item) => (
          <div key={item.step} className={`p-5 bg-surface-50 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors`}>
            <div className={`w-9 h-9 rounded-xl bg-${item.color}-100 text-${item.color}-700 flex items-center justify-center font-extrabold text-sm mb-3 shadow-sm`}>
              {item.step}
            </div>
            <h4 className="font-extrabold text-sm text-surface-900 mb-1.5 tracking-tight">{item.title}</h4>
            <p className="text-xs text-surface-600 leading-relaxed font-medium">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
