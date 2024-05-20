import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {wrapInGit} from './git.mock.js';
import {getCurrentGitRepoPath} from './repo-path.js';

describe(getCurrentGitRepoPath.name, () => {
    itCases(wrapInGit(getCurrentGitRepoPath), [
        {
            it: 'gets the current repo',
            expect: process.cwd(),
        },
    ]);
});
