/**
 * EstimAItor Auto-Update System
 * Automatically loads the latest estimator features from CDN
 * Compatible with any website (WordPress, HTML, React, etc.)
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    CDN_BASE_URL: 'https://cdn.jsdelivr.net/gh/saviorluis/estimaitor@main/dist',
    VERSION_CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    FALLBACK_VERSION: '1.0.0',
    CACHE_KEY: 'estimaitor_version',
    COMPONENT_ID: 'estimaitor-container'
  };

  // Version management
  class VersionManager {
    constructor() {
      this.currentVersion = this.getStoredVersion();
      this.latestVersion = null;
    }

    getStoredVersion() {
      try {
        return localStorage.getItem(CONFIG.CACHE_KEY) || CONFIG.FALLBACK_VERSION;
      } catch {
        return CONFIG.FALLBACK_VERSION;
      }
    }

    setStoredVersion(version) {
      try {
        localStorage.setItem(CONFIG.CACHE_KEY, version);
        this.currentVersion = version;
      } catch (error) {
        console.warn('Could not store version:', error);
      }
    }

    async checkForUpdates() {
      try {
        const response = await fetch(`${CONFIG.CDN_BASE_URL}/version.json`);
        const data = await response.json();
        this.latestVersion = data.version;
        return this.latestVersion !== this.currentVersion;
      } catch (error) {
        console.warn('Could not check for updates:', error);
        return false;
      }
    }
  }

  // Component loader
  class EstimatorLoader {
    constructor(containerId) {
      this.containerId = containerId;
      this.versionManager = new VersionManager();
      this.isLoading = false;
    }

    async loadEstimator(forceUpdate = false) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      
      try {
        // Check for updates
        const hasUpdate = await this.versionManager.checkForUpdates();
        
        if (hasUpdate || forceUpdate) {
          console.log('Loading updated EstimAItor...');
          await this.loadLatestVersion();
        } else {
          console.log('Using cached EstimAItor version');
          await this.loadCachedVersion();
        }
      } catch (error) {
        console.error('Error loading estimator:', error);
        await this.loadFallbackVersion();
      } finally {
        this.isLoading = false;
      }
    }

    async loadLatestVersion() {
      const version = this.versionManager.latestVersion;
      
      // Load CSS
      await this.loadCSS(`${CONFIG.CDN_BASE_URL}/estimator-${version}.css`);
      
      // Load JavaScript
      await this.loadJS(`${CONFIG.CDN_BASE_URL}/estimator-${version}.js`);
      
      // Update stored version
      this.versionManager.setStoredVersion(version);
    }

    async loadCachedVersion() {
      const version = this.versionManager.currentVersion;
      
      // Try to load from cache first
      try {
        await this.loadCSS(`${CONFIG.CDN_BASE_URL}/estimator-${version}.css`);
        await this.loadJS(`${CONFIG.CDN_BASE_URL}/estimator-${version}.js`);
      } catch {
        // Fallback to latest if cache fails
        await this.loadLatestVersion();
      }
    }

    async loadFallbackVersion() {
      console.log('Loading fallback version...');
      await this.loadCSS(`${CONFIG.CDN_BASE_URL}/estimator-${CONFIG.FALLBACK_VERSION}.css`);
      await this.loadJS(`${CONFIG.CDN_BASE_URL}/estimator-${CONFIG.FALLBACK_VERSION}.js`);
    }

    loadCSS(url) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
        document.head.appendChild(link);
      });
    }

    loadJS(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load JS: ${url}`));
        document.head.appendChild(script);
      });
    }

    // Initialize the estimator component
    initializeEstimator() {
      const container = document.getElementById(this.containerId);
      if (!container) {
        console.error(`Container with ID '${this.containerId}' not found`);
        return;
      }

      // Create the estimator component
      container.innerHTML = `
        <div id="estimaitor-app">
          <div class="estimator-loading">
            <div class="loading-spinner"></div>
            <p>Loading EstimAItor...</p>
          </div>
        </div>
      `;

      // Initialize the React component when ready
      if (window.EstimAItor) {
        window.EstimAItor.render(this.containerId);
      } else {
        // Wait for the component to load
        const checkInterval = setInterval(() => {
          if (window.EstimAItor) {
            clearInterval(checkInterval);
            window.EstimAItor.render(this.containerId);
          }
        }, 100);
      }
    }
  }

  // Auto-update scheduler
  class AutoUpdateScheduler {
    constructor(loader) {
      this.loader = loader;
      this.updateInterval = null;
    }

    start() {
      // Check for updates immediately
      this.loader.loadEstimator();
      
      // Schedule periodic checks
      this.updateInterval = setInterval(() => {
        this.loader.loadEstimator();
      }, CONFIG.VERSION_CHECK_INTERVAL);
    }

    stop() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }
  }

  // Public API
  window.EstimAItorAutoUpdate = {
    init: function(containerId = CONFIG.COMPONENT_ID) {
      const loader = new EstimatorLoader(containerId);
      const scheduler = new AutoUpdateScheduler(loader);
      
      // Initialize immediately
      loader.initializeEstimator();
      
      // Start auto-updates
      scheduler.start();
      
      return {
        forceUpdate: () => loader.loadEstimator(true),
        stopUpdates: () => scheduler.stop(),
        getVersion: () => loader.versionManager.currentVersion
      };
    }
  };

  // Auto-initialize if container exists
  if (document.getElementById(CONFIG.COMPONENT_ID)) {
    window.EstimAItorAutoUpdate.init();
  }
})();

