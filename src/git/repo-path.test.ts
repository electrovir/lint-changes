import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {wrapInGit} from './git.mock';
import {getCurrentGitRepoPath} from './repo-path';

describe(getCurrentGitRepoPath.name, () => {
    itCases(wrapInGit(getCurrentGitRepoPath), [
        {
            it: 'gets the current repo',
            expect: process.cwd(),
        },
    ]);
});
