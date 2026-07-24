const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

function getLanguageFromExtension(extension) {
  const map = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'php': 'php',
    'java': 'java',
    'go': 'go',
    'rb': 'ruby',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'sql': 'sql'
  };
  return map[extension] || 'plaintext';
}

function getIconForFile(filename) {
  const extension = getFileExtension(filename);
  const icons = {
    'js': '📄',
    'ts': '📘',
    'py': '🐍',
    'php': '🐘',
    'java': '☕',
    'go': '🐹',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'md': '📝',
    'sh': '⚡',
    'sql': '🗄️',
    'xml': '📄',
    'yaml': '📄',
    'yml': '📄',
    'txt': '📄',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🖼️',
    'ico': '🖼️',
    'pdf': '📕',
    'zip': '📦',
    'tar': '📦',
    'gz': '📦',
    'exe': '⚙️',
    'dll': '⚙️',
    'so': '⚙️'
  };
  return icons[extension] || '📄';
}

function getLanguageIcon(language) {
  const icons = {
    'javascript': '🟨',
    'typescript': '🔵',
    'python': '🐍',
    'php': '🐘',
    'java': '☕',
    'go': '🐹',
    'ruby': '💎',
    'rust': '🦀',
    'kotlin': '🎯',
    'swift': '🐦',
    'c': '⚙️',
    'cpp': '⚙️',
    'csharp': '🎯',
    'html': '🌐',
    'css': '🎨'
  };
  return icons[language] || '📄';
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function truncate(str, length = 50) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

function isBinaryFile(content) {
  // Check if content contains null bytes
  if (typeof content === 'string') {
    return content.includes('\0');
  }
  return false;
}

module.exports = {
  generateId,
  generateToken,
  hashPassword,
  isValidEmail,
  isValidUrl,
  formatBytes,
  getFileExtension,
  getLanguageFromExtension,
  getIconForFile,
  getLanguageIcon,
  sanitizeFilename,
  truncate,
  isBinaryFile
};
