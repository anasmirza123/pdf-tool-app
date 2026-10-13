import { ToolUsageStat } from '../types';

export interface JobRecord {
  id: string;
  toolSlug: string;
  toolName: string;
  timestamp: string;
  originalSize: number;
  processedSize: number;
  durationMs: number;
  status: 'completed' | 'failed';
  errorMessage?: string;
}

const STATS_KEY = 'docuforge_analytics_stats_v1';
const JOBS_KEY = 'docuforge_analytics_jobs_v1';

export class AnalyticsService {
  private static getStoredStats(): Record<string, ToolUsageStat> {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private static saveStats(stats: Record<string, ToolUsageStat>): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // storage quota or private mode fallback
    }
  }

  public static getRecentJobs(): JobRecord[] {
    try {
      const data = localStorage.getItem(JOBS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // No jobs recorded yet in this browser — return an honest empty list.
    // The UI shows a proper empty state rather than fabricated audit rows.
    return [];
  }

  public static trackJob(record: Omit<JobRecord, 'id' | 'timestamp'>): void {
    const jobs = this.getRecentJobs();
    const newJob: JobRecord = {
      ...record,
      id: 'job-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString()
    };
    jobs.unshift(newJob);
    if (jobs.length > 50) jobs.pop();

    try {
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    } catch {
      // ignore
    }

    // Update aggregated stats
    const stats = this.getStoredStats();
    const current = stats[record.toolSlug] || {
      toolId: record.toolSlug,
      toolName: record.toolName,
      count: 0,
      bytesProcessed: 0,
      successCount: 0,
      failCount: 0,
      lastUsed: new Date().toISOString()
    };

    current.count += 1;
    current.bytesProcessed += record.originalSize;
    if (record.status === 'completed') {
      current.successCount += 1;
    } else {
      current.failCount += 1;
    }
    current.lastUsed = new Date().toISOString();
    stats[record.toolSlug] = current;
    this.saveStats(stats);
  }

  public static getAggregatedStats(): {
    totalJobs: number;
    successRate: number;
    totalBytes: number;
    toolsBreakdown: ToolUsageStat[];
  } {
    const stats = this.getStoredStats();
    const list = Object.values(stats);

    let totalJobs = 0;
    let totalSuccess = 0;
    let totalBytes = 0;

    list.forEach((item) => {
      totalJobs += item.count;
      totalSuccess += item.successCount;
      totalBytes += item.bytesProcessed;
    });

    // Real figures only. No seeded/phantom activity — an unused install
    // honestly shows zero, and a 100% rate is meaningless with 0 jobs.
    const successRate = totalJobs > 0 ? (totalSuccess / totalJobs) * 100 : 0;

    return {
      totalJobs,
      successRate: Math.round(successRate * 10) / 10,
      totalBytes,
      toolsBreakdown: list.sort((a, b) => b.count - a.count)
    };
  }
}
