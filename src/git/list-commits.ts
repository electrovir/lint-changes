import {addPrefix, collapseWhiteSpace, filterMap, isTruthy} from '@augment-vir/common';
import {SimpleGit} from 'simple-git';

/**
 * Lists all commits between the given refs, including `latestRef`.
 *
 * @category Internal
 */
export async function listCommits(
    git: Readonly<SimpleGit>,
    {latestRef, baseRef}: {latestRef: string; baseRef: string},
): Promise<string[]> {
    const gitArgs = [
        'rev-list',
        latestRef,
        addPrefix({value: baseRef, prefix: '^'}),
        '--pretty=oneline',
    ];

    const gitOutput = await git.raw(gitArgs);

    const commits = filterMap(gitOutput.split('\n'), (line) => collapseWhiteSpace(line), isTruthy);

    return commits;
}
