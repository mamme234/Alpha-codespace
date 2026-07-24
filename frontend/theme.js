// Theme management for dark/light mode

const THEME_KEY = 'codespace-theme';

class ThemeManager {
  constructor() {
    this.themes = {
      dark: {
        bg: '#1e1e1e',
        bgLight: '#2d2d2d',
        bgDark: '#252526',
        text: '#d4d4d4',
        textMuted: '#858585',
        border: '#333333',
        primary: '#0078d4',
        primaryHover: '#005a9e',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        cardBg: '#2d2d2d',
        inputBg: '#1e1e1e'
      },
      light: {
        bg: '#f3f3f3',
        bgLight: '#ffffff',
        bgDark: '#e8e8e8',
        text: '#1e1e1e',
        textMuted: '#666666',
        border: '#d4d4d4',
        primary: '#0078d4',
        primaryHover: '#005a9e',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        cardBg: '#ffffff',
        inputBg: '#ffffff'
      }
    };
    
    this.currentTheme = this.loadTheme() || 'dark';
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  getTheme() {
    return this.currentTheme;
  }

  getColors() {
    return this.themes[this.currentTheme];
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  setTheme(theme) {
    if (this.themes[theme]) {
      this.currentTheme = theme;
      this.saveTheme(theme);
      this.applyTheme(theme);
    }
  }

  applyTheme(theme) {
    const colors = this.themes[theme];
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--bg-light', colors.bgLight);
    root.style.setProperty('--bg-dark', colors.bgDark);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-hover', colors.primaryHover);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--error', colors.error);
    root.style.setProperty('--card-bg', colors.cardBg);
    root.style.setProperty('--input-bg', colors.inputBg);
    
    // Apply body background and text
    document.body.style.backgroundColor = colors.bg;
    document.body.style.color = colors.text;
    
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = colors.bg;
    }
    
    // Update class on body
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    
    // Update theme toggle button
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme, colors } }));
  }

  getCurrentColors() {
    return this.themes[this.currentTheme];
  }

  // Convenience methods
  get isDark() {
    return this.currentTheme === 'dark';
  }

  get isLight() {
    return this.currentTheme === 'light';
  }
}

// Singleton
let themeInstance = null;

function getThemeManager() {
  if (!themeInstance) {
    themeInstance = new ThemeManager();
  }
  return themeInstance;
}

// Theme toggle component
function createThemeToggle() {
  const toggle = document.createElement('button');
  toggle.id = 'themeToggle';
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle theme');
  
  const themeManager = getThemeManager();
  toggle.textContent = themeManager.isDark ? '☀️' : '🌙';
  
  toggle.addEventListener('click', () => {
    const newTheme = themeManager.toggleTheme();
    toggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });
  
  return toggle;
}

// Apply theme to specific elements
function applyThemeToElement(element, theme) {
  const colors = themeManager.themes[theme];
  if (element.dataset.themeable) {
    Object.keys(colors).forEach(key => {
      if (element.dataset[key]) {
        element.style[key] = colors[key];
      }
    });
  }
}

export { ThemeManager, getThemeManager, createThemeToggle, applyThemeToElement };
