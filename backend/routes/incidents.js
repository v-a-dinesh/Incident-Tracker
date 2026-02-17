const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');

const router = express.Router();

// Valid enum values
const VALID_SEVERITIES = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
const VALID_STATUSES = ['OPEN', 'MITIGATED', 'RESOLVED'];
const VALID_SORT_FIELDS = ['title', 'severity', 'status', 'service', 'created_at', 'updated_at', 'owner'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

// ─── POST /api/incidents ──────────────────────────────────────────
router.post('/', (req, res) => {
  const { title, service, severity, status, owner, summary } = req.body;

  // Validation
  const errors = [];
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string.');
  }
  if (!service || typeof service !== 'string' || service.trim().length === 0) {
    errors.push('Service is required and must be a non-empty string.');
  }
  if (!severity || !VALID_SEVERITIES.includes(severity)) {
    errors.push(`Severity must be one of: ${VALID_SEVERITIES.join(', ')}.`);
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }
  if (owner && typeof owner !== 'string') {
    errors.push('Owner must be a string.');
  }
  if (summary && typeof summary !== 'string') {
    errors.push('Summary must be a string.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const stmt = db.prepare(`
    INSERT INTO incidents (id, title, service, severity, status, owner, summary, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, title.trim(), service.trim(), severity, status, owner?.trim() || null, summary?.trim() || null, now, now);

  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(id);
  res.status(201).json(incident);
});

// ─── GET /api/incidents ───────────────────────────────────────────
router.get('/', (req, res) => {
  const db = getDb();

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  // Filtering
  const conditions = [];
  const params = [];

  if (req.query.search) {
    conditions.push('(title LIKE ? OR service LIKE ? OR owner LIKE ?)');
    const searchTerm = `%${req.query.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (req.query.severity) {
    const severities = req.query.severity.split(',').filter(s => VALID_SEVERITIES.includes(s));
    if (severities.length > 0) {
      conditions.push(`severity IN (${severities.map(() => '?').join(',')})`);
      params.push(...severities);
    }
  }

  if (req.query.status) {
    const statuses = req.query.status.split(',').filter(s => VALID_STATUSES.includes(s));
    if (statuses.length > 0) {
      conditions.push(`status IN (${statuses.map(() => '?').join(',')})`);
      params.push(...statuses);
    }
  }

  if (req.query.service) {
    conditions.push('service = ?');
    params.push(req.query.service);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  let sortField = 'created_at';
  let sortOrder = 'desc';

  if (req.query.sortBy && VALID_SORT_FIELDS.includes(req.query.sortBy)) {
    sortField = req.query.sortBy;
  }
  if (req.query.sortOrder && VALID_SORT_ORDERS.includes(req.query.sortOrder.toLowerCase())) {
    sortOrder = req.query.sortOrder.toLowerCase();
  }

  // Custom severity ordering for natural sorting
  let orderClause;
  if (sortField === 'severity') {
    orderClause = `ORDER BY CASE severity WHEN 'SEV1' THEN 1 WHEN 'SEV2' THEN 2 WHEN 'SEV3' THEN 3 WHEN 'SEV4' THEN 4 END ${sortOrder}`;
  } else {
    orderClause = `ORDER BY ${sortField} ${sortOrder}`;
  }

  // Count total
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM incidents ${whereClause}`);
  const { total } = countStmt.get(...params);

  // Fetch page
  const dataStmt = db.prepare(`SELECT * FROM incidents ${whereClause} ${orderClause} LIMIT ? OFFSET ?`);
  const incidents = dataStmt.all(...params, limit, offset);

  res.json({
    data: incidents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── GET /api/incidents/:id ───────────────────────────────────────
router.get('/:id', (req, res) => {
  const db = getDb();
  const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found.' });
  }

  res.json(incident);
});

// ─── PATCH /api/incidents/:id ─────────────────────────────────────
router.patch('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Incident not found.' });
  }

  const allowedFields = ['title', 'service', 'severity', 'status', 'owner', 'summary'];
  const updates = {};
  const errors = [];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Validate updates
  if (updates.title !== undefined && (typeof updates.title !== 'string' || updates.title.trim().length === 0)) {
    errors.push('Title must be a non-empty string.');
  }
  if (updates.service !== undefined && (typeof updates.service !== 'string' || updates.service.trim().length === 0)) {
    errors.push('Service must be a non-empty string.');
  }
  if (updates.severity !== undefined && !VALID_SEVERITIES.includes(updates.severity)) {
    errors.push(`Severity must be one of: ${VALID_SEVERITIES.join(', ')}.`);
  }
  if (updates.status !== undefined && !VALID_STATUSES.includes(updates.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const setClauses = Object.keys(updates).map(f => `${f} = ?`);
  setClauses.push('updated_at = ?');

  const values = [...Object.values(updates), now, req.params.id];

  db.prepare(`UPDATE incidents SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;
