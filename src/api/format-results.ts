import {ESLint} from 'eslint';
import {sep} from 'node:path';

/**
 * Format an array of lint results into a string using ESLint's own formatter.
 *
 * @category API
 */
export async function formatLintResults(
    cwd: string,
    lintResults: Readonly<ESLint.LintResult>[],
): Promise<string> {
    const eslint = new ESLint({
        cwd,
    });
    const eslintFormatter = await eslint.loadFormatter('stylish');

    return (await eslintFormatter.format(lintResults)).trim().replaceAll(`${cwd}${sep}`, '');
}
