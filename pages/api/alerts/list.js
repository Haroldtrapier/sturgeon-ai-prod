import fs from 'fs';
import path from 'path';

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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alerts = loadAlerts();
    res.status(200).json({ savedSearches: alerts });
  } catch (error) {
    console.error('Error loading alerts:', error);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
}
