const test = require('node:test');
const assert = require('node:assert/strict');
const { describeStatus } = require('../src/services/schedulerStatus');

test('missing, stale, invalid, and stopped heartbeats are offline', () => {
  const now = Date.parse('2026-10-05T01:00:00Z');
  for (const snapshot of [null,
    { state: 'idle', lastHeartbeatAt: '2026-10-05T00:57:00Z' },
    { state: 'idle', lastHeartbeatAt: 'invalid' },
    { state: 'stopped', lastHeartbeatAt: '2026-10-05T01:00:00Z' }
  ]) assert.equal(describeStatus(snapshot, now).online, false);
});

test('a fresh error heartbeat remains online and exposes the failure', () => {
  const status = describeStatus({ state: 'error', lastHeartbeatAt: new Date().toISOString(), lastError: 'DB unavailable' });
  assert.equal(status.online, true);
  assert.equal(status.state, 'error');
  assert.equal(status.lastError, 'DB unavailable');
});

test('a fresh idle heartbeat reports an active scheduler', () => {
  assert.equal(describeStatus({ state: 'idle', lastHeartbeatAt: new Date().toISOString() }).state, 'idle');
});
