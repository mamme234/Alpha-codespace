const fs = require('fs-extra');
const path = require('path');

async function getStorageStats(userId) {
  const userPath = `./projects/${userId}`;
  
  if (!await fs.pathExists(userPath)) {
    return { used: 0, files: 0, folders: 0 };
  }
  
  let totalSize = 0;
  let fileCount = 0;
  let folderCount = 0;
  
  async function walk(dir) {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        folderCount++;
        await walk(fullPath);
      } else {
        fileCount++;
        totalSize += stats.size;
      }
    }
  }
  
  await walk(userPath);
  
  return {
    used: totalSize,
    files: fileCount,
    folders: folderCount
  };
}

async function cleanTempFiles() {
  const tempDir = './backend/temp';
  if (await fs.pathExists(tempDir)) {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    for (const file of files) {
      const fullPath = path.join(tempDir, file);
      const stats = await fs.stat(fullPath);
      // Delete files older than 1 hour
      if (now - stats.mtimeMs > 3600000) {
        await fs.remove(fullPath);
      }
    }
  }
}

async function getProjectSize(projectPath) {
  if (!await fs.pathExists(projectPath)) return 0;
  let size = 0;
  const items = await fs.readdir(projectPath);
  for (const item of items) {
    const fullPath = path.join(projectPath, item);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      size += await getProjectSize(fullPath);
    } else {
      size += stats.size;
    }
  }
  return size;
}

module.exports = { getStorageStats, cleanTempFiles, getProjectSize };
