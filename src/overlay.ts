import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
const start = '/* DEZIV2 OVERLAY START */';
const end = '/* DEZIV2 OVERLAY END */';
export async function updateOverlay(appRoot: string, image?: Buffer, friendImage?: Buffer): Promise<boolean> {
    const path = join(appRoot, 'out', 'vs', 'workbench', 'workbench.desktop.main.css');
    const current = await readFile(path, 'utf8');
    const first = current.indexOf(start);
    const last = current.indexOf(end);
    if ((first < 0) !== (last < 0) || (first >= 0 && last < first)) {
        throw new Error('Hiányos Dezi v2 stílusblokk; a fájl változatlan maradt.');
    }
    const original = first < 0 ? current : current.slice(0, first) + current.slice(last + end.length);
    // ::before, so the original Dezi (body ::after) can stay installed alongside.
    const selector = 'body:has(> .monaco-workbench)::before';
    // The second image lives on <html>, because body already hosts both cats.
    const friendSelector = 'html:has(> body > .monaco-workbench)::after';
    const friend = image !== undefined && friendImage !== undefined;
    const all = friend ? selector + ', ' + friendSelector : selector;
    // Keep the 96 x 89 source at native device-pixel size on HiDPI displays.
    const densityRules = Array.from({ length: 13 }, (_, index) => {
        const density = 1 + index / 4;
        return `@media (min-resolution: ${density}dppx) { ${all} { --deziv2-w: ${96 / density}px; width: ${96 / density}px; height: ${89 / density}px; } }`;
    }).join('\n');
    // Walk from side to side along the bottom, turn around at each edge, and hop while walking.
    // --deziv2-offset puts the second image right next to the cat; --deziv2-pair reserves room for it.
    const animation = `@keyframes deziv2-walk { 0%, 100% { left: calc(18px + var(--deziv2-offset)); } 50% { left: calc(100vw - var(--deziv2-pair) - 18px + var(--deziv2-offset)); } }
@keyframes deziv2-turn { 0% { scale: 1 1; } 50% { scale: -1 1; } }
@keyframes deziv2-hop { 0%, 50%, 100% { translate: 0 0; } 25% { translate: 0 -28px; } }`;
    const pair = friend ? 'calc(2 * var(--deziv2-w) + 12px)' : 'var(--deziv2-w)';
    const shared = all + ' { content: ""; display: block; position: fixed; left: calc(18px + var(--deziv2-offset)); bottom: 34px; --deziv2-w: 96px; --deziv2-offset: 0px; --deziv2-pair: ' + pair + '; width: 96px; height: 89px; z-index: 2540; pointer-events: none; animation: deziv2-walk 24s ease-in-out infinite, deziv2-turn 24s step-end infinite, deziv2-hop 1.2s ease-in-out infinite; }';
    const cat = image ? selector + ' { background: url("data:image/png;base64,' + image.toString('base64') + '") bottom center / contain no-repeat; }' : '';
    // Half a hop cycle later: one jumps while the other stays on the ground.
    const second = friend ? '\n' + friendSelector + ' { --deziv2-offset: calc(var(--deziv2-w) + 12px); animation-delay: 0s, 0s, -0.6s; background: url("data:image/png;base64,' + friendImage.toString('base64') + '") bottom center / contain no-repeat; }' : '';
    const css = image ? start + '\n' + shared + '\n' + cat + second + '\n' + animation + '\n' + densityRules + '\n' + end : '';
    const updated = original + css;
    if (updated === current) { return false; }
    try { await copyFile(path, path + '.deziv2-backup', constants.COPYFILE_EXCL); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') { throw error; } }
    await writeFile(path, updated, 'utf8');
    return true;
}