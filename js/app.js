// ===========================================
// PooL PWA - Main Application
// ===========================================

// State Management
const AppState = {
  currentModule: 'projektlernen',
  theme: 'dark',
  
  init() {
    this.loadPreferences();
    this.registerServiceWorker();
    this.initTheme();
    this.initNavigation();
    this.initInstallPrompt();
  },
  
  loadPreferences() {
    const saved = localStorage.getItem('pool-pwa-preferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      this.theme = prefs.theme || 'dark';
      this.currentModule = prefs.currentModule || 'projektlernen';
    }
  },
  
  savePreferences() {
    localStorage.setItem('pool-pwa-preferences', JSON.stringify({
      theme: this.theme,
      currentModule: this.currentModule
    }));
  },
  
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registriert:', registration.scope);
      } catch (error) {
        console.log('Service Worker Registrierung fehlgeschlagen:', error);
      }
    }
  },
  
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeButton();
  },
  
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeButton();
    this.savePreferences();
  },
  
  updateThemeButton() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
    }
  },
  
  initNavigation() {
    document.querySelectorAll('.module-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const module = tab.dataset.module;
        this.switchModule(module);
      });
    });
    
    // Initial module
    this.switchModule(this.currentModule);
  },
  
  switchModule(module) {
    this.currentModule = module;
    this.savePreferences();
    
    // Update tabs
    document.querySelectorAll('.module-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.module === module);
    });
    
    // Update content
    document.querySelectorAll('.module-content').forEach(content => {
      content.classList.toggle('active', content.id === `module-${module}`);
    });
    
    // Initialize module
    if (module === 'projektlernen' && window.Projektlernen) {
      Projektlernen.render();
    } else if (module === 'selbsteinschaetzung' && window.Selbsteinschaetzung) {
      Selbsteinschaetzung.render();
    }
  },
  
  initInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const installBtn = document.getElementById('installBtn');
      if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.addEventListener('click', async () => {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`Install prompt outcome: ${outcome}`);
          deferredPrompt = null;
          installBtn.style.display = 'none';
        });
      }
    });
  }
};

// ===========================================
// Utility Functions
// ===========================================

const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (indicator) {
      indicator.classList.add('show');
      setTimeout(() => indicator.classList.remove('show'), 2000);
    }
  },
  
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  formatDate(date) {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importJSON(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          callback(data);
        } catch (err) {
          Utils.showToast('Fehler beim Importieren der Datei', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};

// ===========================================
// Initialize App
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});

// Export for module access
window.AppState = AppState;
window.Utils = Utils;
