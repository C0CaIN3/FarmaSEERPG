import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
await mkdir('_site', { recursive: true });
await build({ entryPoints: ['src/cloud-client.mjs'], bundle: true, minify: true, format: 'iife', target: ['es2022'], outfile: '_site/cloud-client.js', legalComments: 'eof' });
// Keep the downloadable, offline-only demo consistent with the app source.
const [html, css, app] = await Promise.all(['index.html', 'styles.css', 'app.js'].map(name => readFile(name, 'utf8')));
const offline = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>${css}</style>`)
  .replace('  <script defer src="config.js"></script>\n', '')
  .replace('  <script defer src="cloud-client.js"></script>\n', '')
  .replace('<script defer src="app.js"></script>', '')
  .replace('</body>', () => `<script>\n${app}\n</script>\n</body>`);
await writeFile('FarmCrew.html', offline);
for (const name of ['index.html', 'app.js', 'styles.css', 'config.js', 'FarmCrew.html', '.nojekyll']) await copyFile(name, `_site/${name}`);
