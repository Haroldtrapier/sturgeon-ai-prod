import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const ALERTS_FILE = path.join(process.cwd(), 'data', 'alerts.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load alerts from file
function loadAlerts() {
  ensureDataDir();
  if (!fs.existsSync(ALERTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading alerts file:', error);
    return [];
  }
}

// Save alerts to file
function saveAlerts(alerts) {
  ensureDataDir();
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, query, marketplace } = req.body;

    // Validate input
    if (!name || !query) {
      return res.status(400).json({ error: 'Name and query are required' });
    }

    // Load existing alerts
    const alerts = loadAlerts();

    // Create new alert
    const newAlert = {
      id: randomUUID(),
      name,
      query,
      marketplace: marketplace || null,
      createdAt: new Date().toISOString(),
    };

    // Add to alerts list
    alerts.push(newAlert);

    // Save to file
    saveAlerts(alerts);

    res.status(201).json({ savedSearch: newAlert });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
}
