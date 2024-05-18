import {collapseWhiteSpace, filterMap, isTruthy} from '@augment-vir/common';
import {GitError, SimpleGit} from 'simple-git';

/**
 * Finds all the branches that contain the given ref.
 *
 * @category Internal
 */
export async function getBranchesContainingRef(
    git: Readonly<SimpleGit>,
    ref: string,
): Promise<string[]> {
    try {
        const gitArgs = [
            'branch',
            '--contains',
            ref,
            '--format',
            '%(refname:short)',
        ];

        const gitOutput = await git.raw(gitArgs);

        return filterMap(
            gitOutput.split('\n'),
            (line) => collapseWhiteSpace(line),
            isTruthy,
        ).sort();
    } catch (caught) {
        if (caught instanceof GitError) {
            /** In this case, the given commit hash does not exist. */
            const isInvalidCommit = caught.message.includes('no such commit');
            /** In this case, the given ref name (such as a branch name) does not exist. */
            const isInvalidRef = caught.message.includes('malformed object name');

            if (isInvalidCommit || isInvalidRef) {
                /**
                 * Rather than throwing an error, we'll just say that there are no branches which
                 * contain this ref (which, after all, is indeed true).
                 */
                return [];
            }
        }
        throw caught;
    }
}
