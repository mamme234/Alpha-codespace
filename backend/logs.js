const fs = require('fs-extra');
const path = require('path');

const LOG_DIR = './backend/logs';

async function initLogs() {
  await fs.ensureDir(LOG_DIR);
}

async function log(type, message, data = null) {
  await initLogs();
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    data
  };
  
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
  await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
}

async function getLogs(date = null) {
  await initLogs();
  const logFile = path.join(LOG_DIR, `${date || new Date().toISOString().split('T')[0]}.log`);
  if (!await fs.pathExists(logFile)) return [];
  
  const content = await fs.readFile(logFile, 'utf-8');
  return content.split('\n').filter(line => line).map(line => JSON.parse(line));
}

async function getRecentLogs(limit = 100) {
  await initLogs();
  const files = await fs.readdir(LOG_DIR);
  const logFiles = files.sort().reverse();
  let logs = [];
  
  for (const file of logFiles) {
    const content = await fs.readFile(path.join(LOG_DIR, file), 'utf-8');
    const entries = content.split('\n').filter(line => line).map(line => JSON.parse(line));
    logs = logs.concat(entries);
    if (logs.length >= limit) break;
  }
  
  return logs.slice(0, limit);
}

module.exports = { log, getLogs, getRecentLogs };
