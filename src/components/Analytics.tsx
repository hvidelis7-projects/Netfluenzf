/**
 * Dashboard “Analytics” tab: KPIs derived from in-app campaigns, wallet, and transactions.
 * Time-series and audience charts show empty placeholders until external analytics are integrated.
 */

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UserRole } from '../types';
import type { LucideIcon } from 'lucide-react';
import { Users, Activity, Target, Wallet, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { playSound } from '../audio.ts';

interface AnalyticsProps {
  role: UserRole;
}

type MetricTrend = 'up' | 'down' | 'neutral';

interface KeyMetricRow {
  label: string;
  value: string;
  change: string;
  trend: MetricTrend;
  icon: LucideIcon;
}

const COLORS = ['#FF5500', '#FF8800', '#FFBB00', '#FFE500'];

function formatKes(n: number): string {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `KES ${Math.round(n).toLocaleString()}`;
  }
}

const Analytics: React.FC<AnalyticsProps> = ({ role }) => {
  const { addNotification, campaigns, walletBalance, escrowBalance, transactions } = useApp();
  const [timeRange, setTimeRange] = useState('6M');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [showAllContent, setShowAllContent] = useState(false);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === 'active' || c.status === 'auditing').length,
    [campaigns]
  );

  const engagementPlaceholder = useMemo(
    () => [{ name: '—', instagram: 0, tiktok: 0, youtube: 0 }],
    []
  );

  const filteredEngagement = useMemo(() => engagementPlaceholder, [timeRange, engagementPlaceholder]);

  const campaignPerformance = useMemo(() => {
    const rows = campaigns.slice(0, 8).map((c) => ({
      name: c.title.length > 14 ? `${c.title.slice(0, 14)}…` : c.title,
      value: Math.max(0, c.budget || 0),
    }));
    return rows.length ? rows : [{ name: 'No campaigns', value: 0 }];
  }, [campaigns]);

  const demographics = useMemo(() => [{ name: 'No audience data', value: 1 }], []);

  const platformMix = useMemo(() => {
    const tally: Record<string, number> = {};
    for (const c of campaigns) {
      const p = c.platform || 'Other';
      tally[p] = (tally[p] || 0) + 1;
    }
    const entries = Object.entries(tally);
    if (!entries.length) {
      return [
        { name: 'Instagram', value: 0 },
        { name: 'TikTok', value: 0 },
        { name: 'YouTube', value: 0 },
        { name: 'Other', value: 0 },
      ];
    }
    const total = entries.reduce((s, [, n]) => s + n, 0);
    return entries.map(([name, n]) => ({ name, value: total ? Math.round((n / total) * 100) : 0 }));
  }, [campaigns]);

  const keyMetrics = useMemo((): KeyMetricRow[] => {
    const spent = transactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return [
      {
        label: 'Wallet balance',
        value: formatKes(walletBalance),
        change: 'Live',
        trend: 'neutral',
        icon: Wallet,
      },
      {
        label: 'In escrow',
        value: formatKes(escrowBalance),
        change: 'Live',
        trend: 'neutral',
        icon: Activity,
      },
      {
        label: role === UserRole.BRAND ? 'Active campaigns' : 'Open jobs',
        value: String(activeCampaigns),
        change: `${campaigns.length} total`,
        trend: 'neutral',
        icon: Target,
      },
      {
        label: role === UserRole.BRAND ? 'Outflow (ledger)' : 'Inflow (ledger)',
        value: formatKes(spent),
        change: `${transactions.length} rows`,
        trend: 'neutral',
        icon: Users,
      },
    ];
  }, [role, walletBalance, escrowBalance, activeCampaigns, campaigns.length, transactions]);

  const handleExport = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines: string[] = [];
    lines.push(['Netfluenz analytics export', '', ''].map(esc).join(','));
    lines.push(['Generated (UTC)', new Date().toISOString(), ''].map(esc).join(','));
    lines.push(['Role', role, ''].map(esc).join(','));
    lines.push(['Time range', timeRange, ''].map(esc).join(','));
    lines.push(['Platform filter', selectedPlatform, ''].map(esc).join(','));
    lines.push('');
    lines.push(['Key metrics', 'Value', 'Note', ''].map(esc).join(','));
    keyMetrics.forEach((m) => {
      lines.push([m.label, m.value, m.change, ''].map(esc).join(','));
    });
    lines.push('');
    lines.push(['Campaign', 'Budget (KES)'].map(esc).join(','));
    campaignPerformance.forEach((c) => {
      lines.push([c.name, c.value].map(esc).join(','));
    });
    lines.push('');
    lines.push(['Note', 'Engagement time series and audience demographics are placeholders until telemetry is connected.', ''].map(esc).join(','));

    const csv = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netfluenz-analytics-${role.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    playSound('success');
    addNotification('CSV report downloaded.');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black serif italic brand-text">Performance</h2>
          <p className="text-sm text-gray-500 font-medium">
            Figures below come from your Netfluenz workspace (campaigns, wallet, ledger). Connect external analytics for reach and demographics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {keyMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className="glass-card p-6 rounded-[2rem] flex flex-col justify-between hover:bg-white/60 transition-colors duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/50 rounded-xl text-gray-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{metric.label}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    metric.trend === 'up'
                      ? 'bg-green-100/50 text-green-700'
                      : metric.trend === 'down'
                        ? 'bg-red-100/50 text-red-700'
                        : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  {metric.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                  {metric.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                  {metric.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black serif italic text-gray-900 mt-4 break-words">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] col-span-1 lg:col-span-2 relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black serif italic brand-text">
              {role === UserRole.BRAND ? 'Cross-platform traction' : 'Audience engagement'}
            </h3>
            <div className="flex gap-2 items-center">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-white/50 border border-white/60 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-600 outline-none focus:border-gray-400 hover:bg-white/80 transition-colors cursor-pointer"
              >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
              </select>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              {['1M', '3M', '6M', '1Y'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    timeRange === range ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Connect Instagram / TikTok / YouTube insights APIs to populate this chart; placeholder shows zero until then.
          </p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredEngagement} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInsta" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1306C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTikTok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorYouTube" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0000" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    padding: '12px',
                  }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {(selectedPlatform === 'All' || selectedPlatform === 'Instagram') && (
                  <Area type="monotone" dataKey="instagram" stackId="1" stroke="#E1306C" strokeWidth={3} fill="url(#colorInsta)" name="Instagram" />
                )}
                {(selectedPlatform === 'All' || selectedPlatform === 'TikTok') && (
                  <Area type="monotone" dataKey="tiktok" stackId="1" stroke="#000000" strokeWidth={3} fill="url(#colorTikTok)" name="TikTok" />
                )}
                {(selectedPlatform === 'All' || selectedPlatform === 'YouTube') && (
                  <Area type="monotone" dataKey="youtube" stackId="1" stroke="#FF0000" strokeWidth={3} fill="url(#colorYouTube)" name="YouTube" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8">Platform mix (campaigns)</h3>
          <div className="space-y-6">
            {platformMix.map((platform, idx) => (
              <div key={platform.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900">{platform.name}</span>
                  <span className="text-xs font-medium text-gray-500">{platform.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${platform.value}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">
            {role === UserRole.BRAND ? 'Campaign budgets' : 'Your campaigns'}
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} interval={0} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" fill="#FF5500" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Audience demographics</h3>
          <p className="text-xs text-gray-500 mb-2">No audience breakdown is stored in-app yet.</p>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {demographics.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">N/A</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Recent campaigns</h3>
            <button
              type="button"
              onClick={() => setShowAllContent(!showAllContent)}
              className="text-[9px] font-bold text-[#FF5500] hover:text-orange-600 uppercase tracking-widest"
            >
              {showAllContent ? 'Less' : 'More'}
            </button>
          </div>
          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No campaigns yet.</p>
            ) : (
              campaigns.slice(0, showAllContent ? 6 : 3).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-white/40 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center text-lg">
                    {c.platform === 'TikTok' ? '🎵' : c.platform === 'YouTube' ? '▶️' : '📷'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-bold text-gray-900 truncate">{c.title}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                      {c.platform} · {c.status}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black text-[#FF5500]">{formatKes(c.budget || 0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-black transition-colors shadow-lg hover:shadow-xl active:scale-95 transform duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">Export report</span>
        </button>
      </div>
    </div>
  );
};

export default Analytics;
