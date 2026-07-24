const { Project, File, Workspace, Deployment } = require('./models');
const { saveFile, deleteFileSystem } = require('./filesystem');
const { deployToVercel, deployToNetlify } = require('./deployment');
const fs = require('fs-extra');
const path = require('path');

// PROJECT CONTROLLERS
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 
      userId: req.user.id, 
      isArchived: false 
    }).sort({ lastOpened: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, language, framework, template, description } = req.body;
    const projectPath = `./projects/${req.user.id}/${Date.now()}`;
    
    const project = new Project({
      name,
      description: description || '',
      language: language || 'javascript',
      framework: framework || '',
      template: template || '',
      userId: req.user.id,
      path: projectPath
    });
    
    await project.save();
    await fs.ensureDir(projectPath);
    
    // Create initial files
    await createTemplateFiles(projectPath, template);
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { name, description, isFavorite } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, isFavorite, updatedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await File.deleteMany({ projectId: project._id });
    await fs.remove(project.path);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FILE CONTROLLERS
const getFiles = async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.id });
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFile = async (req, res) => {
  try {
    const { path: filePath, content, type } = req.body;
    const file = new File({
      projectId: req.params.id,
      path: filePath,
      content: content || '',
      type: type || 'file'
    });
    await file.save();
    await saveFile(req.params.id, filePath, content || '');
    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const file = await File.findOneAndUpdate(
      { projectId: req.params.id, path: filePath },
      { content, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    await saveFile(req.params.id, filePath, content);
    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { path: filePath } = req.body;
    await File.findOneAndDelete({ projectId: req.params.id, path: filePath });
    await deleteFileSystem(req.params.id, filePath);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// WORKSPACE CONTROLLERS
const createWorkspace = async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const workspace = new Workspace({
      projectId: project._id,
      userId: req.user.id,
      status: 'running'
    });
    await workspace.save();

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ 
      projectId: req.params.id, 
      userId: req.user.id 
    });
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const stopWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndUpdate(
      { projectId: req.params.id, userId: req.user.id },
      { status: 'stopped', stoppedAt: new Date() },
      { new: true }
    );
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DEPLOYMENT CONTROLLER
const deployProject = async (req, res) => {
  try {
    const { projectId, platform } = req.body;
    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const deployment = new Deployment({
      projectId: project._id,
      userId: req.user.id,
      platform: platform || 'vercel',
      status: 'pending'
    });
    await deployment.save();

    let url = '';
    if (platform === 'vercel') {
      url = await deployToVercel(project.path);
    } else if (platform === 'netlify') {
      url = await deployToNetlify(project.path);
    }

    deployment.status = 'success';
    deployment.url = url;
    await deployment.save();

    res.json({ success: true, deployment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STORAGE CONTROLLER
const getStorageUsage = async (req, res) => {
  try {
    const userPath = `./projects/${req.user.id}`;
    const size = await fs.pathExists(userPath) ? await getDirectorySize(userPath) : 0;
    res.json({ 
      success: true, 
      usage: size,
      limit: parseInt(process.env.MAX_STORAGE) || 1073741824
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HELPER FUNCTIONS
async function createTemplateFiles(projectPath, template) {
  const templates = {
    'react': {
      'package.json': JSON.stringify({
        name: 'react-app',
        version: '1.0.0',
        private: true,
        dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
        scripts: { start: 'react-scripts start', build: 'react-scripts build' }
      }, null, 2),
      'src/App.js': 'function App() { return <h1>Hello World</h1>; } export default App;',
      'src/index.js': "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);",
      'public/index.html': '<!DOCTYPE html><html><head><title>React App</title></head><body><div id="root"></div></body></html>'
    },
    'default': {
      'index.html': '<!DOCTYPE html><html><head><title>My Project</title></head><body><h1>Hello World</h1></body></html>',
      'README.md': '# My Project\n\nCreated with Codespace'
    }
  };

  const files = templates[template] || templates.default;
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectPath, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
  }
}

async function getDirectorySize(dirPath) {
  let size = 0;
  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  return size;
}

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getFiles,
  createFile,
  updateFile,
  deleteFile,
  createWorkspace,
  getWorkspace,
  stopWorkspace,
  deployProject,
  getStorageUsage
};
