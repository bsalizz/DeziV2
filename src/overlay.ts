import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
const start = '/* DEZIV2 OVERLAY START */';
const end = '/* DEZIV2 OVERLAY END */';
export async function updateOverlay(appRoot: string, image?: Buffer): Promise<boolean> {
    const path = join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.css');
    const current = await readFile(path, 'utf8');
    const first = current.indexOf(start);
    const last = current.indexOf(end);
    if ((first < 0) !== (last < 0) || (first >= 0 && last < first)) {
        throw new Error('Hiányos Dezi v2 stílusblokk; a fájl változatlan maradt.');
    }
    const original = first < 0 ? current : current.slice(0, first) + current.slice(last + end.length);
    // ::before, so the original Dezi (::after) can stay installed alongside.
    const selector = 'body:has(> .monaco-workbench)::before';
    // Keep the 96 x 89 source at native device-pixel size on HiDPI displays.
    const densityRules = Array.from({ length: 13 }, (_, index) => {
        const density = 1 + index / 4;
        return `@media (min-resolution: ${density}dppx) { ${selector} { --deziv2-w: ${96 / density}px; width: ${96 / density}px; height: ${89 / density}px; } }`;
    }).join('\n');
    // Walk from side to side along the bottom, turn around at each edge, and hop while walking.
    const animation = `@keyframes deziv2-walk { 0%, 100% { left: 18px; } 50% { left: calc(100vw - var(--deziv2-w) - 18px); } }
@keyframes deziv2-turn { 0% { scale: 1 1; } 50% { scale: -1 1; } }
@keyframes deziv2-hop { 0%, 60%, 100% { translate: 0 0; } 30% { translate: 0 -28px; } }`;
    const css = image ? start + '\n' + selector + ' { content: ""; display: block; position: fixed; left: 18px; bottom: 34px; --deziv2-w: 96px; width: 96px; height: 89px; z-index: 2540; pointer-events: none; background: url("data:image/png;base64,' + image.toString('base64') + '") bottom center / contain no-repeat; animation: deziv2-walk 24s ease-in-out infinite, deziv2-turn 24s step-end infinite, deziv2-hop 0.8s ease-in-out infinite; }\n' + animation + '\n' + densityRules + '\n' + end : '';
    const updated = original + css;
    if (updated === current) { return false; }
    try { await copyFile(path, path + '.deziv2-backup', constants.COPYFILE_EXCL); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') { throw error; } }
    await writeFile(path, updated, 'utf8');
    return true;
}
