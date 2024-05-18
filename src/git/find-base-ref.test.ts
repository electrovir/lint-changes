import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {testBranchNames, testCommits} from '../repo-git-refs.mock';
import {findBaseRef} from './find-base-ref';
import {wrapInGit} from './git.mock';

describe(findBaseRef.name, () => {
    itCases(wrapInGit(findBaseRef), [
        {
            it: 'gets a correct base ref',
            input: testBranchNames.child,
            expect: testCommits.parentAndChildMergeBase,
        },
        {
            it: 'works on commit hashes',
            input: testCommits.childBranchHead,
            expect: testCommits.parentAndChildMergeBase,
        },
        {
            it: 'fails to find a base ref',
            input: testCommits.testingRoot,
            throws: 'Failed to find a git base for calculating changes against',
        },
    ]);
});
