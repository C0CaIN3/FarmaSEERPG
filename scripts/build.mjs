import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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
for (const name of ['app.js', 'styles.css', 'config.js', 'FarmCrew.html', '.nojekyll']) await copyFile(name, `_site/${name}`);
// Version every asset by content so browsers and the Pages CDN never mix an old script with a new page.
const version = async name => createHash('sha256').update(await readFile(`_site/${name}`)).digest('hex').slice(0, 12);
let page = html;
for (const name of ['styles.css', 'config.js', 'cloud-client.js', 'app.js']) {
  const tag = name.endsWith('.css') ? `href="${name}"` : `src="${name}"`;
  if (!page.includes(tag)) throw new Error(`index.html does not reference ${name}`);
  const v = await version(name);
  page = page.replace(tag, () => tag.replace(name, `${name}?v=${v}`));
}
await writeFile('_site/index.html', page);

// FarmDesk (shared farm tracker) lives in its own folder with its own Supabase project.
await mkdir('_site/farmdesk/assets', { recursive: true });
await build({ entryPoints: ['farmdesk/cloud.mjs'], bundle: true, minify: true, format: 'iife', target: ['es2022'], outfile: '_site/farmdesk/cloud.js', legalComments: 'eof' });
for (const name of ['app.js', 'art.js', 'style.css', 'config.js', 'assets/mark.svg']) await copyFile(`farmdesk/${name}`, `_site/farmdesk/${name}`);
let desk = await readFile('farmdesk/index.html', 'utf8');
for (const name of ['style.css', 'config.js', 'cloud.js', 'art.js', 'app.js']) {
  const tag = name.endsWith('.css') ? `href="${name}"` : `src="${name}"`;
  if (!desk.includes(tag)) throw new Error(`farmdesk/index.html does not reference ${name}`);
  const v = await version(`farmdesk/${name}`);
  desk = desk.replace(tag, () => tag.replace(name, `${name}?v=${v}`));
}
await writeFile('_site/farmdesk/index.html', desk);
