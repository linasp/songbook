// postbuild-manifest.js
// Generates asset-manifest.json after Vite build


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const manifestPath = path.join(distDir, 'asset-manifest.json');
const baseUrl = '/songbook/'; // Change if your GH Pages repo name changes

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

const files = {};
const entrypoints = [];

walk(distDir, file => {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const url = baseUrl + rel;
  files[rel] = url;
  // Entry points: main.*.js and main.*.css in static/js|css
  if (/^static\/(js|css)\/main\.[\w]+\.(js|css)$/.test(rel)) {
    entrypoints.push(rel);
  }
});

// Add index.html
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  files['index.html'] = baseUrl + 'index.html';
}

const manifest = {
  files,
  entrypoints
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.warn('asset-manifest.json generated.');
