import {runShellCommand} from '@augment-vir/node-js';
import {SimpleGit} from 'simple-git';

/**
 * Setup the current directory for linting of past files.
 *
 * @category Internal
 */
export async function setupForPastLinting(
    git: Readonly<SimpleGit>,
    {pastRef, pastSetupCommand, cwd}: {pastRef: string; pastSetupCommand: string; cwd: string},
): Promise<void> {
    await git.checkout(pastRef);
    await runShellCommand(pastSetupCommand, {rejectOnError: true, cwd});
}
