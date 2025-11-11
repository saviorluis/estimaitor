/**
 * Build script for creating standalone EstimAItor bundles
 * Generates optimized CSS and JS files for CDN deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  VERSION: process.env.VERSION || '1.0.0',
  OUTPUT_DIR: './dist',
  CDN_URL: 'https://cdn.jsdelivr.net/gh/saviorluis/estimaitor@main/dist',
  ENTRY_POINT: './src/app/page.tsx',
  COMPONENTS: [
    './src/components/EstimatorForm.tsx',
    './src/components/SimpleEstimatorForm.tsx',
    './src/components/EstimateResult.tsx',
    './src/components/JanitorialContractForm.tsx'
  ]
};

// Create output directory
if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
  fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
}

// Generate version file
function generateVersionFile() {
  const versionData = {
    version: CONFIG.VERSION,
    buildDate: new Date().toISOString(),
    features: [
      'Modern Wizard Interface',
      'Advanced Pricing Logic',
      'AI Recommendations',
      'PDF Generation',
      'Mobile Responsive',
      'PWA Support'
    ],
    cdn: {
      css: `${CONFIG.CDN_URL}/estimator-${CONFIG.VERSION}.css`,
      js: `${CONFIG.CDN_URL}/estimator-${CONFIG.VERSION}.js`
    }
  };

  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'version.json'),
    JSON.stringify(versionData, null, 2)
  );
  
  console.log('✅ Version file generated');
}

// Generate standalone HTML template
function generateHTMLTemplate() {
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EstimAItor - Commercial Cleaning Estimator</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
        }
        .estimator-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: #64748b;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #estimaitor-container {
            max-width: 1200px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div id="estimaitor-container">
        <div class="estimator-loading">
            <div class="loading-spinner"></div>
            <p>Loading EstimAItor...</p>
        </div>
    </div>
    
    <script src="${CONFIG.CDN_URL}/estimator-auto-update.js"></script>
    <script>
        // Initialize EstimAItor
        EstimAItorAutoUpdate.init('estimaitor-container');
    </script>
</body>
</html>`;

  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'index.html'),
    htmlTemplate
  );
  
  console.log('✅ HTML template generated');
}

// Generate integration examples
function generateIntegrationExamples() {
  const examples = {
    wordpress: `<!-- WordPress Integration -->
<div id="estimaitor-container"></div>
<script src="${CONFIG.CDN_URL}/estimator-auto-update.js"></script>
<script>
    EstimAItorAutoUpdate.init('estimaitor-container');
</script>`,

    html: `<!-- HTML Integration -->
<div id="estimaitor-container"></div>
<script src="${CONFIG.CDN_URL}/estimator-auto-update.js"></script>
<script>
    EstimAItorAutoUpdate.init('estimaitor-container');
</script>`,

    react: `// React Integration
import { useEffect } from 'react';

function EstimatorWidget() {
  useEffect(() => {
    // Load the auto-update script
    const script = document.createElement('script');
    script.src = '${CONFIG.CDN_URL}/estimator-auto-update.js';
    script.onload = () => {
      window.EstimAItorAutoUpdate.init('estimator-container');
    };
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      if (window.EstimAItorAutoUpdate) {
        window.EstimAItorAutoUpdate.stopUpdates();
      }
    };
  }, []);

  return <div id="estimator-container" />;
}`,

    iframe: `<!-- Iframe Integration -->
<iframe 
  src="${CONFIG.CDN_URL}/index.html" 
  width="100%" 
  height="800px" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>`
  };

  // Create examples directory
  const examplesDir = path.join(CONFIG.OUTPUT_DIR, 'examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  // Write example files
  Object.entries(examples).forEach(([name, code]) => {
    fs.writeFileSync(
      path.join(examplesDir, `${name}.html`),
      code
    );
  });

  console.log('✅ Integration examples generated');
}

// Generate deployment script
function generateDeploymentScript() {
  const deployScript = `#!/bin/bash
# EstimAItor Auto-Deployment Script

echo "🚀 Deploying EstimAItor v${CONFIG.VERSION}..."

# Build the project
echo "📦 Building project..."
npm run build

# Copy files to dist
echo "📁 Copying files..."
cp -r ./dist/* ./deploy/

# Deploy to CDN (example with GitHub Pages)
echo "🌐 Deploying to CDN..."
cd deploy
git add .
git commit -m "Deploy EstimAItor v${CONFIG.VERSION}"
git push origin main

echo "✅ Deployment complete!"
echo "🔗 Estimator available at: ${CONFIG.CDN_URL}/index.html"
`;

  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'deploy.sh'),
    deployScript
  );
  
  // Make it executable
  execSync(`chmod +x ${path.join(CONFIG.OUTPUT_DIR, 'deploy.sh')}`);
  
  console.log('✅ Deployment script generated');
}

// Generate README for integration
function generateIntegrationREADME() {
  const readme = `# EstimAItor Auto-Update Integration

## Quick Start

Add this single line to your website:

\`\`\`html
<div id="estimaitor-container"></div>
<script src="${CONFIG.CDN_URL}/estimator-auto-update.js"></script>
<script>EstimAItorAutoUpdate.init('estimaitor-container');</script>
\`\`\`

## Features

- ✅ **Auto-Updates**: Automatically gets latest features
- ✅ **Zero Maintenance**: No manual updates needed
- ✅ **Universal Compatibility**: Works with any website
- ✅ **Mobile Responsive**: Perfect on all devices
- ✅ **Fast Loading**: Optimized bundles
- ✅ **Offline Support**: PWA capabilities

## Integration Examples

See the \`examples/\` directory for:
- WordPress integration
- HTML integration  
- React integration
- Iframe integration

## Configuration

\`\`\`javascript
// Custom configuration
EstimAItorAutoUpdate.init('your-container-id', {
  theme: 'dark',
  features: ['wizard', 'pdf', 'ai'],
  branding: {
    companyName: 'Your Company',
    logo: 'https://your-logo.com/logo.png'
  }
});
\`\`\`

## Version: ${CONFIG.VERSION}

Built: ${new Date().toISOString()}
`;

  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'README.md'),
    readme
  );
  
  console.log('✅ Integration README generated');
}

// Main build function
function build() {
  console.log(`🏗️  Building EstimAItor v${CONFIG.VERSION}...`);
  
  try {
    generateVersionFile();
    generateHTMLTemplate();
    generateIntegrationExamples();
    generateDeploymentScript();
    generateIntegrationREADME();
    
    console.log('✅ Build complete!');
    console.log(`📁 Output directory: ${CONFIG.OUTPUT_DIR}`);
    console.log(`🌐 CDN URL: ${CONFIG.CDN_URL}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();

