'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChangeItem } from '../../lib/changes';

interface ChangeChartProps {
  changes: ChangeItem[];
  title?: string;
  defaultChartType?: 'bar' | 'area' | 'donut' | 'source';
}

type ChartType = 'bar' | 'area' | 'donut' | 'source';

const ACTION_COLORS = {
  created: '#10b981', // Emerald
  updated: '#03b5d3', // Cyan
  deleted: '#f43f5e', // Rose
  other: '#a855f7',   // Purple
};

export function ChangeChart({
  changes,
  title = 'ACTIVITY & CHANGE DRIFT ANALYTICS',
  defaultChartType = 'bar',
}: ChangeChartProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Daily aggregated data for Bar and Area charts
  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; created: number; updated: number; deleted: number; total: number }>();

    // Sort changes oldest first for chronological chart progression
    const sorted = [...changes].sort(
      (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    );

    for (const c of sorted) {
      const dateStr = new Date(c.changedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const current = map.get(dateStr) || { date: dateStr, created: 0, updated: 0, deleted: 0, total: 0 };
      if (c.action === 'created') current.created++;
      else if (c.action === 'updated') current.updated++;
      else if (c.action === 'deleted') current.deleted++;
      current.total++;
      map.set(dateStr, current);
    }

    return Array.from(map.values());
  }, [changes]);

  // 2. Action distribution for Donut / Pie chart
  const actionDistribution = useMemo(() => {
    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const c of changes) {
      if (c.action === 'created') created++;
      else if (c.action === 'updated') updated++;
      else if (c.action === 'deleted') deleted++;
    }

    const items = [
      { name: 'Added (+)', value: created, color: ACTION_COLORS.created },
      { name: 'Updated (~)', value: updated, color: ACTION_COLORS.updated },
      { name: 'Removed (-)', value: deleted, color: ACTION_COLORS.deleted },
    ].filter((item) => item.value > 0);

    return items;
  }, [changes]);

  // 3. Source & Role distribution
  const sourceAndRoleData = useMemo(() => {
    const cliCount = changes.filter((c) => c.source === 'cli').length;
    const dashboardCount = changes.filter((c) => c.source === 'dashboard').length;
    const ownerCount = changes.filter((c) => c.userRole === 'Owner').length;
    const editorCount = changes.filter((c) => c.userRole === 'Editor').length;
    const viewerCount = changes.filter((c) => c.userRole === 'Viewer').length;

    return [
      { category: 'CLI Terminal', count: cliCount, fill: '#10b981' },
      { category: 'Dashboard UI', count: dashboardCount, fill: '#03b5d3' },
      { category: 'Owner Actions', count: ownerCount, fill: '#ffb95f' },
      { category: 'Editor Actions', count: editorCount, fill: '#4cd7f6' },
      { category: 'Viewer Actions', count: viewerCount, fill: '#bbcabf' },
    ].filter((item) => item.count > 0);
  }, [changes]);

  // Summary counts
  const totalCount = changes.length;
  const createdCount = changes.filter((c) => c.action === 'created').length;
  const updatedCount = changes.filter((c) => c.action === 'updated').length;
  const deletedCount = changes.filter((c) => c.action === 'deleted').length;

  if (changes.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-xs text-[#86948a] font-mono border border-[#3c4a42]/50 rounded-xl bg-[#0d0e13]">
        <span className="material-symbols-outlined text-[28px] text-[#86948a] mb-1">insights</span>
        <span>No audit activity records available for chart visualization</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0d0e13] border border-[#3c4a42] rounded-xl p-4 space-y-3 shadow-sm">
      {/* Top Header & Chart View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3c4a42]/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">analytics</span>
            <span className="text-xs font-mono font-semibold text-[#e3e1e9] tracking-wider uppercase">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#86948a] mt-0.5">
            <span>{totalCount} total actions</span>
            <span>•</span>
            <span className="text-[#4edea3]">+{createdCount} added</span>
            <span>•</span>
            <span className="text-[#4cd7f6]">~{updatedCount} modified</span>
            <span>•</span>
            <span className="text-rose-400">-{deletedCount} removed</span>
          </div>
        </div>

        {/* 4 Interactive Chart Type Tabs */}
        <div className="inline-flex rounded-lg bg-[#1a1b21] p-1 border border-[#3c4a42] text-xs font-mono">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              chartType === 'bar'
                ? 'bg-[#10b981]/20 text-[#4edea3] font-semibold border border-[#10b981]/40'
                : 'text-[#bbcabf] hover:text-[#e3e1e9]'
            }`}
            title="Daily Change Frequency (Bar Chart)"
          >
            <span className="material-symbols-outlined text-[14px]">bar_chart</span>
            <span>Frequency</span>
          </button>

          <button
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              chartType === 'area'
                ? 'bg-[#03b5d3]/20 text-[#4cd7f6] font-semibold border border-[#03b5d3]/40'
                : 'text-[#bbcabf] hover:text-[#e3e1e9]'
            }`}
            title="Drift Velocity Trend (Area Spline Chart)"
          >
            <span className="material-symbols-outlined text-[14px]">show_chart</span>
            <span>Trend</span>
          </button>

          <button
            onClick={() => setChartType('donut')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              chartType === 'donut'
                ? 'bg-[#ffb95f]/20 text-[#ffb95f] font-semibold border border-[#ffb95f]/40'
                : 'text-[#bbcabf] hover:text-[#e3e1e9]'
            }`}
            title="Action Composition Breakdown (Donut Chart)"
          >
            <span className="material-symbols-outlined text-[14px]">donut_large</span>
            <span>Breakdown</span>
          </button>

          <button
            onClick={() => setChartType('source')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              chartType === 'source'
                ? 'bg-[#a855f7]/20 text-purple-400 font-semibold border border-purple-500/40'
                : 'text-[#bbcabf] hover:text-[#e3e1e9]'
            }`}
            title="Sources & Roles Distribution"
          >
            <span className="material-symbols-outlined text-[14px]">hub</span>
            <span>Sources</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-56 w-full pt-2">
        {!mounted ? (
          <div className="h-full flex items-center justify-center text-xs text-[#86948a] font-mono animate-pulse">
            Loading charts...
          </div>
        ) : chartType === 'bar' ? (
          /* 1. Bar Chart: Daily Frequency */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#86948a" fontSize={11} tickLine={false} />
              <YAxis stroke="#86948a" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1b21',
                  borderColor: '#3c4a42',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              />
              <Bar name="Added" dataKey="created" fill={ACTION_COLORS.created} stackId="a" radius={[0, 0, 0, 0]} />
              <Bar name="Updated" dataKey="updated" fill={ACTION_COLORS.updated} stackId="a" radius={[0, 0, 0, 0]} />
              <Bar name="Removed" dataKey="deleted" fill={ACTION_COLORS.deleted} stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : chartType === 'area' ? (
          /* 2. Area Chart: Trend & Velocity */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACTION_COLORS.created} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={ACTION_COLORS.created} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="updatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACTION_COLORS.updated} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={ACTION_COLORS.updated} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="deletedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACTION_COLORS.deleted} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={ACTION_COLORS.deleted} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#86948a" fontSize={11} tickLine={false} />
              <YAxis stroke="#86948a" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1b21',
                  borderColor: '#3c4a42',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="created"
                name="Added"
                stroke={ACTION_COLORS.created}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#createdGrad)"
              />
              <Area
                type="monotone"
                dataKey="updated"
                name="Updated"
                stroke={ACTION_COLORS.updated}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#updatedGrad)"
              />
              <Area
                type="monotone"
                dataKey="deleted"
                name="Removed"
                stroke={ACTION_COLORS.deleted}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#deletedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartType === 'donut' ? (
          /* 3. Donut / Pie Chart: Action Breakdown */
          <div className="h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1b21',
                    borderColor: '#3c4a42',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: number) => [`${val} actions (${Math.round((val / totalCount) * 100)}%)`, 'Count']}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Pie
                  data={actionDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* 4. Horizontal Bar Chart: Sources & Roles Distribution */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sourceAndRoleData}
              margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
            >
              <XAxis type="number" stroke="#86948a" fontSize={11} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#bbcabf"
                fontSize={11}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1b21',
                  borderColor: '#3c4a42',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <Bar dataKey="count" name="Action Count" radius={[0, 4, 4, 0]}>
                {sourceAndRoleData.map((entry, index) => (
                  <Cell key={`source-cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
