#!/usr/bin/env node
//@ts-check
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const platform = os.platform() === 'win32' ? 'win32' : 'unix';
const seaConfig = `${ root }/sea.${ platform }.json`;

try {
    fs.rmSync(path.resolve(root, 'dist'), { recursive: true });
} catch {};
fs.mkdirSync(path.resolve(root, 'dist'));

esbuild.buildSync({
    entryPoints: [ 'src/main.ts' ],
    bundle: true,
    minify: true,
    outfile: path.resolve(root, 'dist', 'interpreter.js'),
    platform: 'node',
    banner: platform === 'win32' ? undefined : { js: '#!/usr/bin/env node' },
    tsconfig: path.resolve(root, 'tsconfig.json')
});

spawnSync(
    'node',
    [ '--build-sea', seaConfig ],
    { cwd: root }
);

const { output } = JSON.parse(fs.readFileSync(seaConfig).toString());
if (platform == 'unix')
    spawnSync('chmod', [ '+x', path.resolve(root, output) ]);

console.log('Built SEA interprerer in: ' + path.resolve(root, output));