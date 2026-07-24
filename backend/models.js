const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  githubId: { type: String, default: '' },
  googleId: { type: String, default: '' },
  isVerified: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, default: 'javascript' },
  framework: { type: String, default: '' },
  template: { type: String, default: '' },
  path: { type: String, required: true },
  isArchived: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  lastOpened: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// File Schema
const fileSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  path: { type: String, required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['file', 'folder'], default: 'file' },
  size: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Workspace Schema
const workspaceSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  containerId: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['creating', 'running', 'stopped', 'error'], 
    default: 'creating' 
  },
  port: { type: Number, default: 3000 },
  memory: { type: Number, default: 1024 },
  startedAt: { type: Date, default: Date.now },
  stoppedAt: { type: Date }
});

// Deployment Schema
const deploymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['vercel', 'netlify', 'render', 'github-pages'], required: true },
  url: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  logs: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const File = mongoose.model('File', fileSchema);
const Workspace = mongoose.model('Workspace', workspaceSchema);
const Deployment = mongoose.model('Deployment', deploymentSchema);

module.exports = { User, Project, File, Workspace, Deployment };
