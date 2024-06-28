import {describe, it} from 'mocha';
import {assertDefined} from 'run-time-assertions';
import {getCurrentBranch} from './current-branch.js';
import {callWithGit} from './git.mock.js';

describe(getCurrentBranch.name, () => {
    it('gets a branch name', async () => {
        assertDefined(await callWithGit(getCurrentBranch));
    });
});
