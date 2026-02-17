const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./database');

const SERVICES = ['Auth', 'Payments', 'Backend', 'Frontend', 'Database', 'API Gateway', 'Notifications', 'Search', 'Analytics', 'CDN'];
const SEVERITIES = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
const STATUSES = ['OPEN', 'MITIGATED', 'RESOLVED'];
const OWNERS = ['jason@team.com', 'amy@team.com', 'dev@team.com', 'ops@team.com', 'sre@team.com', 'admin@team.com', 'lead@team.com', null];

const TITLE_TEMPLATES = [
  'Login Failure', 'Payment Delay', 'API Timeout', 'UI Bug on Dashboard',
  'Database Issue', 'Memory Leak Detected', 'SSL Certificate Expiry',
  'High Latency on Endpoint', 'Service Unavailable', 'Data Sync Failure',
  'Rate Limiting Triggered', 'Deployment Rollback', 'Cache Invalidation Error',
  'DNS Resolution Failure', 'Disk Space Critical', 'CPU Spike Alert',
  'Network Partition', 'Authentication Token Expired', 'Queue Backlog',
  'Replication Lag Detected', 'Config Drift', 'Health Check Failing',
  'Connection Pool Exhausted', 'Deadlock Detected', 'Schema Migration Failed',
  'Hot Partition Issue', 'Cascading Failure', 'Circuit Breaker Open',
  'Retry Storm', 'Webhook Delivery Failure'
];

const SUMMARY_TEMPLATES = [
  'Intermittent failures observed causing user-facing impact.',
  'Service degradation detected during peak traffic hours.',
  'Automated alerts triggered; investigation in progress.',
  'Root cause identified as a misconfigured deployment parameter.',
  'Users reporting errors; team investigating upstream dependencies.',
  'Monitoring dashboards showing anomalous patterns.',
  'Rollback initiated after canary deployment showed elevated error rates.',
  'Incident auto-detected by observability tooling.',
  'Partial outage affecting a subset of users in the EU region.',
  'Performance regression introduced in the latest release.',
  'Third-party dependency causing cascading failures.',
  'Database connection pool saturation leading to request timeouts.',
  'Load balancer health checks failing for multiple instances.',
  'Spike in 5xx errors correlated with recent code push.',
  'Investigating memory pressure on production nodes.',
  null
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function seed(count = 200) {
  const db = getDb();

  // Clear existing data
  db.exec('DELETE FROM incidents');

  const insert = db.prepare(`
    INSERT INTO incidents (id, title, service, severity, status, owner, summary, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((incidents) => {
    for (const inc of incidents) {
      insert.run(inc.id, inc.title, inc.service, inc.severity, inc.status, inc.owner, inc.summary, inc.createdAt, inc.updatedAt);
    }
  });

  const incidents = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(startDate, endDate);
    const updatedAt = randomDate(new Date(createdAt), endDate);
    incidents.push({
      id: uuidv4(),
      title: `${randomItem(TITLE_TEMPLATES)} #${i + 1}`,
      service: randomItem(SERVICES),
      severity: randomItem(SEVERITIES),
      status: randomItem(STATUSES),
      owner: randomItem(OWNERS),
      summary: randomItem(SUMMARY_TEMPLATES),
      createdAt,
      updatedAt,
    });
  }

  insertMany(incidents);
  console.log(`Seeded ${count} incidents successfully.`);
}

seed();
