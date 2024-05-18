import {runShellCommand} from '@augment-vir/node-js';
import {ESLint} from 'eslint';

/**
 * Runs ESLint on the give list of files.
 *
 * @category Internal
 */
export async function lintFiles({
    filePaths,
    eslintArgString,
    cwd,
}: {
    filePaths: ReadonlyArray<string>;
    eslintArgString: string;
    cwd: string;
}): Promise<ESLint.LintResult[]> {
    /** Use the ESLint CLI instead of its API because the API has major performance issues. */
    const commandOutput = await runShellCommand(
        `eslint --format json ${eslintArgString} ${filePaths.map((filePath) => `'${filePath}'`).join(' ')}`,
        {cwd},
    );

    try {
        const results = JSON.parse(commandOutput.stdout) as ESLint.LintResult[];

        return results;
    } catch {
        throw new Error(commandOutput.stderr);
    }
}
