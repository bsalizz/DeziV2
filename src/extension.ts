import * as vscode from 'vscode';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { updateOverlay } from './overlay';
async function readOptional(path: string): Promise<Buffer | undefined> {
    try { return await readFile(path); }
    catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return undefined; }
        throw error;
    }
}
export function activate(context: vscode.ExtensionContext): void {
    const change = async (visible: boolean) => {
        try {
            const media = join(context.extensionPath, 'media');
            const image = visible ? await readFile(join(media, 'cica.png')) : undefined;
            // The second image is optional: without media/dezi.png only the cat walks.
            const friend = visible ? await readOptional(join(media, 'dezi.png')) : undefined;
            if (await updateOverlay(vscode.env.appRoot, image, friend)) {
                void vscode.window.showInformationMessage(
                    'Dezi v2: a változás megjelenítéséhez zárd be az összes VS Code-ablakot, majd indítsd újra a VS Code-ot. A Reload Window önmagában nem mindig frissíti a stílust.');
            }
        } catch (error) { void vscode.window.showErrorMessage('Dezi v2: ' + String(error)); }
    };
    context.subscriptions.push(
        vscode.commands.registerCommand('deziv2.show', () => change(true)),
        vscode.commands.registerCommand('deziv2.hide', () => change(false))
    );
}