import {SimpleGit} from 'simple-git';

/**
 * Gets the dir path for the current root git repo.
 *
 * @category Internal
 */
export async function getCurrentGitRepoPath(git: Readonly<SimpleGit>): Promise<string> {
    const gitArgs = [
        'rev-parse',
        '--show-toplevel',
    ];

    const gitOutput = await git.raw(gitArgs);

    return gitOutput.trim();
}
