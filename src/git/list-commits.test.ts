import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {testBranchNames} from '../repo-git-refs.mock.js';
import {wrapInGit} from './git.mock.js';
import {listCommits} from './list-commits.js';

describe(listCommits.name, () => {
    itCases(wrapInGit(listCommits), [
        {
            it: 'lists commits properly',
            input: {
                latestRef: testBranchNames.child,
                baseRef: testBranchNames.parent,
            },
            expect: [
                '0b15691629e30e5db19a3f68ef4a1ad64dc89fbb file edited',
                '034a845d02b7955d9bb9c08331415a7bc2360383 file renamed',
                'f5a8c9898f0af1401e7fecb90748f44b48292156 deleted file',
            ],
        },
    ]);
});
