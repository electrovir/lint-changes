import {log, runShellCommand} from '@augment-vir/node-js';
import {ESLint} from 'eslint';
import {relative} from 'path';

/**
 * Runs ESLint on the give list of files.
 *
 * @category Internal
 */
export async function lintFiles({
    filePaths,
    eslintArgString,
    cwd,
    silent,
}: {
    filePaths: ReadonlyArray<string>;
    eslintArgString: string;
    cwd: string;
    silent: boolean;
}): Promise<ESLint.LintResult[]> {
    if (!silent) {
        log.faint(`Linting ${filePaths.length} files:`);
        filePaths.forEach((filePath) => {
            log.faint(`    ${relative(cwd, filePath)}`);
        });
    }

    /** Use the ESLint CLI instead of its API because the API has major performance issues. */
    const commandOutput = await runShellCommand(
        `eslint --no-warn-ignored --format json ${eslintArgString} ${filePaths.map((filePath) => `'${filePath}'`).join(' ')}`,
        {cwd},
    );

    try {
        const results = JSON.parse(commandOutput.stdout) as ESLint.LintResult[];

        return results;
    } catch {
        throw new Error(commandOutput.stderr);
    }
}
