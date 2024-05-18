import {wait} from '@augment-vir/common';
import {log, logColors, logIf} from '@augment-vir/node-js';
import {ESLint} from 'eslint';
import simpleGit from 'simple-git';
import {filterLintResults} from '../eslint/filter-lint-results';
import {lintFiles} from '../eslint/lint-files';
import {listChangedFiles} from '../git/changes';
import {findBaseRef} from '../git/find-base-ref';
import {listCommits} from '../git/list-commits';
import {ApiArgs, apiArgsShape} from './api-args';
import {setupForPastLinting} from './setup-past-linting';

/**
 * This is the main entry point to this package's API. Based on the given arguments, this detects
 * changed files and runs linting on them for present and maybe past file contents. It returns a
 * list of lint results. To see format those results, see `formatLintResults`.
 *
 * @category API
 */
export async function lintChanges(
    apiArgs: Readonly<Partial<ApiArgs>> = {},
    eslintArgString: string = '',
): Promise<ESLint.LintResult[]> {
    const gitRef = 'HEAD';
    const cwd = apiArgs.cwd || apiArgsShape.defaultValue.cwd;
    const git = simpleGit(cwd);

    const fullArgs: Readonly<ApiArgs> = {
        ...apiArgsShape.defaultValue,
        ...apiArgs,
        baseRef: apiArgs.baseRef || (await findBaseRef(git, gitRef)),
        cwd,
    };

    if (!fullArgs.silent) {
        /**
         * The `wait` calls in here are to compensate for GitHub Actions' logging frequently being
         * out of order. This helps a lot without introducing too much waiting.
         */
        await wait(10);
        const commits = await listCommits(git, {baseRef: fullArgs.baseRef, latestRef: gitRef});
        log.faint(
            `Linting changes from '${logColors.bold}${fullArgs.baseRef}${logColors.faint}' to '${logColors.bold}${gitRef}${logColors.faint}'`,
        );
        log.faint('Linting the following commits:');
        commits.forEach((commit) => {
            log.faint(`    ${commit}`);
        });
        await wait(10);
    }

    const changedFiles = await listChangedFiles(git, {ref: gitRef, relativeTo: fullArgs.baseRef});

    if (fullArgs.checkoutBaseRef) {
        const presentResults = await lintFiles({
            eslintArgString,
            filePaths: changedFiles.map((changedFile) => changedFile.latestFilePath),
            cwd,
        });
        await setupForPastLinting(git, {
            pastRef: fullArgs.baseRef,
            pastSetupCommand: fullArgs.pastSetupCommand,
            cwd,
        });
        const pastResults = await lintFiles({
            eslintArgString,
            filePaths: changedFiles.map(
                (changedFile) => changedFile.previousFilePath || changedFile.latestFilePath,
            ),
            cwd,
        });
        return filterLintResults({past: pastResults, present: presentResults});
    } else {
        /** Only lint the latest files. Do not compare them with past files. */

        logIf.warning(!fullArgs.silent, 'Only linting current files.');

        return await lintFiles({
            eslintArgString,
            filePaths: changedFiles.map((changedFile) => changedFile.latestFilePath),
            cwd,
        });
    }
}
