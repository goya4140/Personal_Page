import { cp, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
execFileSync('python3', ['scripts/personalize.py'], { stdio: 'inherit' });
await import('./build-blog.mjs');
await import('./clean-routes.mjs');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'blog.html', 'blog', 'en', 'assets', 'LICENSE.md']) await cp(path, `dist/${path}`, { recursive: true });
console.log('Static site built in dist/');
