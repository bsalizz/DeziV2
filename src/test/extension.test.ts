import * as assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { updateOverlay } from '../overlay';
test('Repeat install and removal preserve existing CSS and backup', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deziv2-test-'));
    try {
        const directory = join(root, 'out', 'vs', 'workbench');
        await mkdir(directory, { recursive: true });
        const path = join(directory, 'workbench.desktop.main.css');
        const original = 'body { color: red; }\n';
        await writeFile(path, original);
        assert.equal(await updateOverlay(root, Buffer.from('image')), true);
        assert.equal(await updateOverlay(root, Buffer.from('image')), false);
        assert.equal(await readFile(path + '.deziv2-backup', 'utf8'), original);
        assert.ok((await readFile(path, 'utf8')).includes('pointer-events: none'));
        assert.ok((await readFile(path, 'utf8')).includes('body:has(> .monaco-workbench)::before'));
        assert.ok((await readFile(path, 'utf8')).includes('position: fixed'));
        assert.ok((await readFile(path, 'utf8')).includes('@keyframes deziv2-walk'));
        assert.equal(await updateOverlay(root, Buffer.from('updated image')), true);
        assert.equal((await readFile(path, 'utf8')).split('/* DEZIV2 OVERLAY START */').length, 2);
        assert.equal(await readFile(path + '.deziv2-backup', 'utf8'), original);
        assert.equal(await updateOverlay(root), true);
        assert.equal(await readFile(path, 'utf8'), original);
        assert.equal(await updateOverlay(root), false);
    } finally { await rm(root, { recursive: true, force: true }); }
});

test('Second image walks beside the cat and hops in turn', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deziv2-test-'));
    try {
        const directory = join(root, 'out', 'vs', 'workbench');
        await mkdir(directory, { recursive: true });
        const path = join(directory, 'workbench.desktop.main.css');
        const original = 'body { color: red; }\n';
        await writeFile(path, original);
        assert.equal(await updateOverlay(root, Buffer.from('cat'), Buffer.from('friend')), true);
        const css = await readFile(path, 'utf8');
        assert.ok(css.includes('html:has(> body > .monaco-workbench)::after'));
        assert.ok(css.includes(Buffer.from('cat').toString('base64')));
        assert.ok(css.includes(Buffer.from('friend').toString('base64')));
        assert.ok(css.includes('animation-delay: 0s, 0s, -0.6s'));
        assert.equal(css.split('/* DEZIV2 OVERLAY START */').length, 2);
        assert.equal(await updateOverlay(root), true);
        assert.equal(await readFile(path, 'utf8'), original);
    } finally { await rm(root, { recursive: true, force: true }); }
});