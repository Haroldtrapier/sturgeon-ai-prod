import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const ALERTS_FILE = path.join(process.cwd(), 'data', 'alerts.json');
const MAX_NAME_LENGTH = 200;
const MAX_QUERY_LENGTH = 500;
const MAX_MARKETPLACE_LENGTH = 50;

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Ignore if already exists
  }
}

// Load alerts from file
async function loadAlerts() {
  await ensureDataDir();
  try {
    const data = await fs.readFile(ALERTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading alerts file:', error);
    return [];
  }
}

// Save alerts to file
async function saveAlerts(alerts) {
  await ensureDataDir();
  await fs.writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
}

// Sanitize string input
function sanitizeString(str, maxLength) {
  if (typeof str !== 'string') return '';
  // Remove potential XSS characters and trim
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, query, marketplace } = req.body;

    // Validate input types
    if (typeof name !== 'string' || typeof query !== 'string') {
      return res.status(400).json({ error: 'Name and query must be strings' });
    }

    // Sanitize and validate input
    const sanitizedName = sanitizeString(name, MAX_NAME_LENGTH);
    const sanitizedQuery = sanitizeString(query, MAX_QUERY_LENGTH);
    const sanitizedMarketplace = marketplace 
      ? sanitizeString(marketplace, MAX_MARKETPLACE_LENGTH) 
      : null;

    if (!sanitizedName || !sanitizedQuery) {
      return res.status(400).json({ error: 'Name and query cannot be empty' });
    }

    // Load existing alerts
    const alerts = await loadAlerts();

    // Create new alert
    const newAlert = {
      id: randomUUID(),
      name: sanitizedName,
      query: sanitizedQuery,
      marketplace: sanitizedMarketplace || null,
      createdAt: new Date().toISOString(),
    };

    // Add to alerts list
    alerts.push(newAlert);

    // Save to file
    await saveAlerts(alerts);

    res.status(201).json({ savedSearch: newAlert });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
}
