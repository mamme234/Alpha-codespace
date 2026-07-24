const fs = require('fs-extra');
const path = require('path');
const { Project } = require('./models');

async function getProjectPath(projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');
  return project.path;
}

async function saveFile(projectId, filePath, content) {
  const projectPath = await getProjectPath(projectId);
  const fullPath = path.join(projectPath, filePath);
  await fs.ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, content || '');
}

async function deleteFileSystem(projectId, filePath) {
  const projectPath = await getProjectPath(projectId);
  const fullPath = path.join(projectPath, filePath);
  if (await fs.pathExists(fullPath)) {
    await fs.remove(fullPath);
  }
}

async function readFile(projectId, filePath) {
  const projectPath = await getProjectPath(projectId);
  const fullPath = path.join(projectPath, filePath);
  if (await fs.pathExists(fullPath)) {
    return await fs.readFile(fullPath, 'utf-8');
  }
  return '';
}

async function getProjectFiles(projectId) {
  const projectPath = await getProjectPath(projectId);
  const files = [];
  
  async function walk(dir) {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      const relativePath = path.relative(projectPath, fullPath);
      files.push({
        path: relativePath,
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size,
        modified: stats.mtime
      });
      if (stats.isDirectory()) {
        await walk(fullPath);
      }
    }
  }
  
  await walk(projectPath);
  return files;
}

async function zipProject(projectId) {
  const projectPath = await getProjectPath(projectId);
  const zipPath = path.join(path.dirname(projectPath), `${path.basename(projectPath)}.zip`);
  const archiver = require('archiver');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(projectPath, false);
  await archive.finalize();
  return zipPath;
}

module.exports = { saveFile, deleteFileSystem, readFile, getProjectFiles, zipProject };
