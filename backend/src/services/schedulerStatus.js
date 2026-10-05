const STATUS_KEY = 'scheduler:auto-publish:status';
const STALE_AFTER_MS = 150000;

function describeStatus(snapshot, now = Date.now()) {
  if (!snapshot) return { state: 'offline', online: false, message: 'Scheduler belum terhubung.' };
  const online = snapshot.state !== 'stopped' && Number.isFinite(Date.parse(snapshot.lastHeartbeatAt)) &&
    now - Date.parse(snapshot.lastHeartbeatAt) < STALE_AFTER_MS;
  return { ...snapshot, online, state: online ? snapshot.state : 'offline' };
}

module.exports = { STATUS_KEY, STALE_AFTER_MS, describeStatus };
