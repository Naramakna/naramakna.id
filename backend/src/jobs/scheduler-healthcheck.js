const fs = require('fs');
const { describeStatus } = require('../services/schedulerStatus');
try {
  const status = describeStatus(JSON.parse(fs.readFileSync('/tmp/naramakna-scheduler-health.json', 'utf8')));
  const recentSuccess = Date.now() - Date.parse(status.lastSuccessAt) < 150000;
  process.exit(status.online && status.state !== 'error' && recentSuccess ? 0 : 1);
} catch (_) {
  process.exit(1);
}
