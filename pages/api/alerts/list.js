import fs from 'fs/promises';
import path from 'path';

const ALERTS_FILE = path.join(process.cwd(), 'data', 'alerts.json');

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alerts = await loadAlerts();
    res.status(200).json({ savedSearches: alerts });
  } catch (error) {
    console.error('Error loading alerts:', error);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
}
