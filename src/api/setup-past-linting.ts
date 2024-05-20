import {logIf, runShellCommand} from '@augment-vir/node-js';
import {SimpleGit} from 'simple-git';

/**
 * Setup the current directory for linting of past files.
 *
 * @category Internal
 */
export async function setupForPastLinting(
    git: Readonly<SimpleGit>,
    {
        pastRef,
        pastSetupCommand,
        cwd,
        silent,
    }: {
        pastRef: string;
        pastSetupCommand: string;
        cwd: string;
        silent: boolean;
    },
): Promise<void> {
    logIf.faint(!silent, `Checking out '${pastRef}'`);
    await git.checkout(pastRef);
    logIf.faint(!silent, `Running '${pastSetupCommand}'`);
    await runShellCommand(pastSetupCommand, {rejectOnError: true, cwd});
}
