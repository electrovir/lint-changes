import {collapseWhiteSpace, isLengthAtLeast} from '@augment-vir/common';
import {SimpleGit} from 'simple-git';
import {getBranchesContainingRef} from './containing-branches.js';

const madRefDistance = 100;

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
 * Automatically tries to find a branch which looks like it's the base branch for the given
 * `startingRef`.
 *
 * @category Internal
 */
export async function findBaseRef(git: Readonly<SimpleGit>, startingRef: string): Promise<string> {
    const baseBranch = await findBaseBranch(git, startingRef);
    const mergeBase = collapseWhiteSpace(
        await git.raw([
            'merge-base',
            startingRef,
            baseBranch,
        ]),
    );

    if (!mergeBase) {
        throw new FailedToFindBaseError();
    }

    return mergeBase;
}

async function findBaseBranch(git: Readonly<SimpleGit>, startingRef: string) {
    let refDistance = 1;
    const branchesContainingHead = new Set(await getBranchesContainingRef(git, startingRef));

    while (refDistance < madRefDistance) {
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
