import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {testBranchNames, testCommits} from '../repo-git-refs.mock.js';
import {getBranchesContainingRef} from './containing-branches.js';
import {wrapInGit} from './git.mock.js';

describe(getBranchesContainingRef.name, () => {
    itCases(wrapInGit(getBranchesContainingRef), [
        {
            it: 'finds only one branch',
            input: testBranchNames.sibling,
            expect: [testBranchNames.sibling],
        },
        {
            it: 'finds multiple branches',
            input: testCommits.parentAndChildMergeBase,
            expect: [
                testBranchNames.child,
                testBranchNames.parent,
                testBranchNames.sibling,
            ],
        },
        {
            it: 'finds no branches that contain a missing commit hash',
            input: '0000000000000000000000000000000000000000',
            expect: [],
        },
        {
            it: 'finds no branches that contain a missing branch name',
            input: 'non-existent-branch-name',
            expect: [],
        },
    ]);
});
