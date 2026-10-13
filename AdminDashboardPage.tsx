import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  HardDrive,
  Activity,
  Layers,
  RefreshCw,
  Lock
} from 'lucide-react';
import { AnalyticsService, JobRecord } from '../services/analyticsService';
import { formatBytes } from '../utils/formatters';

// NOTE: This is a lightweight client-side gate, not real authentication —
// with no backend, there is no way to truly secure this route (anyone can
// read this constant in the shipped JS bundle). It only stops the dashboard
// from being one accidental click away for an ordinary visitor. Real access
// control needs a server-side login (see Phase 2 of the architecture doc).
const ADMIN_PASSCODE = 'docuforge-admin';
const ADMIN_SESSION_KEY = 'docuforge_admin_unlocked';

export const AdminDashboardPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState<boolean>(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [stats, setStats] = useState(AnalyticsService.getAggregatedStats());
  const [jobs, setJobs] = useState<JobRecord[]>(AnalyticsService.getRecentJobs());
  const [filterTool, setFilterTool] = useState<string>('all');

  const refreshData = () => {
    setStats(AnalyticsService.getAggregatedStats());
    setJobs(AnalyticsService.getRecentJobs());
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === ADMIN_PASSCODE) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const filteredJobs = jobs.filter((j) => (filterTool === 'all' ? true : j.toolSlug === filterTool));

  if (!unlocked) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Admin Access</h1>
        <p className="mt-2 text-sm text-slate-400">
          This console is restricted. Enter the passcode to continue.
        </p>
        <form onSubmit={handleUnlock} className="mt-6 w-full space-y-3">
          <input
            type="password"
            value={passcodeInput}
            onChange={(e) => {
              setPasscodeInput(e.target.value);
              setPasscodeError(false);
            }}
            placeholder="Passcode"
            autoFocus
            className={`w-full rounded-lg border bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 ${
              passcodeError ? 'border-rose-500' : 'border-slate-700'
            }`}
          />
          {passcodeError && (
            <p className="text-left text-xs text-rose-400">Incorrect passcode. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-indigo-400 mb-2">
            <Activity className="h-3.5 w-3.5" />
            <span>Operational Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            System & Usage Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Local processing history for this browser — DocuForge runs entirely client-side,
            so there's no server collecting usage across visitors.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Jobs Executed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {stats.totalJobs.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            this browser, all time
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Success Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-400 tracking-tight">
            {stats.successRate}%
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Engine validation pass rate
          </p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Data Processed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatBytes(stats.totalBytes)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            In-memory stream throughput
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cloud Storage Used</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <HardDrive className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white tracking-tight">
            0.00 Bytes
          </p>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">
            Zero cloud retention policy
          </p>
        </div>
      </div>

      {/* Breakdown Section: Most-Used Tools & Engine Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Most-Used Tools List */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Most-Used Document Tools
          </h2>
          <div className="space-y-3">
            {stats.toolsBreakdown.length > 0 ? (
              stats.toolsBreakdown.slice(0, 6).map((item, idx) => (
                <div key={item.toolId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-mono">#{idx + 1}</span>
                    <span className="truncate font-medium text-slate-200">{item.toolName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-indigo-400">{item.count} runs</span>
                    <span className="text-slate-500">{formatBytes(item.bytesProcessed)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                No tools used yet in this browser. Usage will appear here as tools are run.
              </p>
            )}
          </div>
        </div>

        {/* Recent Jobs Audit Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Recent Processing Jobs (Client Audit Log)
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All tools</option>
                {Array.from(new Map(jobs.map((j) => [j.toolSlug, j.toolName])).entries()).map(
                  ([slug, name]) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  )
                )}
              </select>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                Showing last {filteredJobs.length} events
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredJobs.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                {jobs.length === 0
                  ? 'No processing jobs recorded yet in this browser.'
                  : 'No jobs match the selected tool filter.'}
              </p>
            ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-2 font-medium">Job ID</th>
                  <th className="pb-2 font-medium">Tool</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{job.id}</td>
                    <td className="py-2.5 font-medium text-white">{job.toolName}</td>
                    <td className="py-2.5 font-mono text-[11px]">
                      {formatBytes(job.originalSize)}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">
                      {job.durationMs}ms
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          job.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {job.status === 'completed' ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
