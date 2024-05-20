import {execSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const tsEntryPointFile = join(repoRoot, 'src', 'github-action', 'run-as-github-action.ts');
const nodeModulesDir = join(repoRoot, 'node_modules');

async function runTypeScriptAction() {
    if (!existsSync(nodeModulesDir)) {
        console.info('Installing dependencies...');
        execSync('npm ci --omit=dev', {
            cwd: repoRoot,
        });
    }

    console.info('Starting action...');
    const augmentVir = await import('@augment-vir/node-js');
    const {error} = await augmentVir.runShellCommand(
        `npx tsx ${augmentVir.interpolationSafeWindowsPath(tsEntryPointFile)}`,
        {
            hookUpToConsole: true,
            cwd: repoRoot,
        },
    );

    if (error) {
        process.exit(1);
    }
}

void runTypeScriptAction();
