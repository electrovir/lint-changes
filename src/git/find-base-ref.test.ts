import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {testBranchNames, testCommits} from '../repo-git-refs.mock.js';
import {findBaseBranch, getMergeBase} from './find-base-ref.js';
import {wrapInGit} from './git.mock.js';

describe(findBaseBranch.name, () => {
    itCases(wrapInGit(findBaseBranch), [
        {
            it: 'gets a correct base branch',
            input: testBranchNames.child,
            expect: testBranchNames.parent,
        },
        {
            it: 'works on commit hashes',
            input: testCommits.childBranchHead,
            expect: testBranchNames.parent,
        },
        {
            it: 'fails to find a base ref',
            input: testCommits.testingRoot,
            throws: 'Failed to find a git base for calculating changes against',
        },
    ]);
});

describe(getMergeBase.name, () => {
    itCases(wrapInGit(getMergeBase), [
        {
            it: 'calculates correct merge base between branches',
            input: {
                startingRef: testBranchNames.child,
                baseRef: testBranchNames.parent,
            },
            expect: testCommits.parentAndChildMergeBase,
        },
        {
            it: 'works on commit hashes',
            input: {
                startingRef: testCommits.childBranchHead,
                baseRef: testBranchNames.parent,
            },
            expect: testCommits.parentAndChildMergeBase,
        },
        {
            it: 'fails to find a merge diff',
            input: {
                startingRef: testCommits.testingRoot,
                baseRef: 'dev',
            },
            throws: 'Failed to find a merge base',
        },
    ]);
});
