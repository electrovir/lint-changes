import {collapseWhiteSpace, isLengthAtLeast} from '@augment-vir/common';
import {SimpleGit} from 'simple-git';
import {getBranchesContainingRef} from './containing-branches.js';

const maxRefDistance = 100;

/**
 * An error which indicates that no base branch was able to be detected. This means one of the
 * following:
 *
 * - You need to checkout with more depth in your GitHub action
 * - You need to manually provide a ref
 *
 * @category API
 */
export class FailedToFindBaseError extends Error {
    public override name = 'FailedToFindBaseBranchError';
    constructor() {
        super('Failed to find a git base for calculating changes against.');
    }
}

/**
 * Finds the merge base commit hash for the given ref and base ref.
 *
 * @category Internal
 */
export async function getMergeBase(
    git: Readonly<SimpleGit>,
    {
        startingRef,
        baseRef,
    }: {
        startingRef: string;
        baseRef: string;
    },
) {
    const mergeBase = collapseWhiteSpace(
        await git.raw([
            'merge-base',
            startingRef,
            baseRef,
        ]),
    );

    if (!mergeBase) {
        throw new Error(`Failed to find a merge base between '${baseRef}' and '${startingRef}'`);
    }

    return mergeBase;
}

/**
 * Automatically tries to find a branch which looks like it's the base branch for the given
 * `startingRef`.
 *
 * @category Internal
 */
export async function findBaseBranch(git: Readonly<SimpleGit>, startingRef: string) {
    let refDistance = 1;
    const branchesContainingHead = new Set(await getBranchesContainingRef(git, startingRef));

    while (refDistance < maxRefDistance) {
        const newRef = [
            startingRef,
            refDistance,
        ].join('~');
        const branches = await getBranchesContainingRef(git, newRef);

        const newBranches = branches.filter((branch) => !branchesContainingHead.has(branch));

        if (isLengthAtLeast(newBranches, 1)) {
            return newBranches[0];
        }

        refDistance++;
    }

    throw new FailedToFindBaseError();
}
