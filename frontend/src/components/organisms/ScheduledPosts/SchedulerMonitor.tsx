import { useEffect, useRef, useState } from 'react';
import { schedulerAPI } from '../../../services/api/scheduler';
import type { SchedulerStatus } from '../../../services/api/scheduler';

export default function SchedulerMonitor({ onRefresh }: { onRefresh: () => void }) {
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [error, setError] = useState(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    let cancelled = false;
    let busy = false;
    let loaded = false;
    let lastPublishedAt: string | undefined;
    const load = async () => {
      if (busy) return;
      busy = true;
      try {
        const next = await schedulerAPI.getStatus();
        if (cancelled) return;
        const publishedAt = next.recentPublished?.[0]?.publishedAt;
        if (loaded && publishedAt && publishedAt !== lastPublishedAt) refreshRef.current();
        loaded = true;
        lastPublishedAt = publishedAt;
        setStatus(next);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        busy = false;
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const time = (value?: string) => value ? new Date(value).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB' : '—';
  const healthy = !error && status?.online && status.state !== 'error';
  const label = error ? 'Monitoring tidak terhubung' : !status ? 'Memeriksa scheduler…' :
    !status.online ? 'Scheduler offline' : status.state === 'error' ? 'Publish mengalami error' :
    status.state === 'running' ? 'Memeriksa artikel' : 'Scheduler aktif';

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-gray-900">Auto-publish</h3>
        <span className={`rounded-full px-3 py-1 text-sm ${healthy ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{label}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600">Artikel diperiksa setiap {status?.intervalSeconds || 60} detik. Status diperbarui setiap 15 detik.</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-gray-500">Heartbeat terakhir</dt><dd>{time(status?.lastHeartbeatAt)}</dd></div>
        <div><dt className="text-gray-500">Pemeriksaan sukses terakhir</dt><dd>{time(status?.lastSuccessAt)}</dd></div>
        <div><dt className="text-gray-500">Terbit pada pemeriksaan terakhir</dt><dd>{status?.lastPublishedCount ?? '—'} artikel</dd></div>
      </dl>
      {!error && status?.lastError && <p className="mt-3 text-sm text-red-700">{status.lastError}</p>}
      {error && <p className="mt-3 text-sm text-amber-800">Status terbaru belum tersedia. Periksa koneksi API dan Redis.</p>}
      {!error && status && !status.online && <p className="mt-3 text-sm text-amber-800">Auto-publish belum aktif atau heartbeat sudah kedaluwarsa. Periksa service scheduler di Docker.</p>}
      {!!status?.recentPublished?.length && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-sm font-medium text-gray-700">Publikasi terbaru</p>
          <ul className="space-y-1 text-sm text-gray-600">
            {status.recentPublished.slice(0, 3).map(post => <li key={`${post.id}-${post.publishedAt}`}>{post.title} · {time(post.publishedAt)}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
