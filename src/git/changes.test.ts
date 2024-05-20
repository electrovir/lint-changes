import {itCases} from '@augment-vir/chai';
import {mapObjectValues} from '@augment-vir/common';
import {describe} from 'mocha';
import {relative} from 'node:path';
import {testBranchNames, testCommits} from '../repo-git-refs.mock.js';
import {packageRootDir} from '../repo-paths.mock.js';
import {listChangedFiles} from './changes.js';
import {callWithGit} from './git.mock.js';

describe(listChangedFiles.name, () => {
    async function testListChangedFiles({ref, relativeTo}: {ref: string; relativeTo: string}) {
        return (await callWithGit(listChangedFiles, {ref, relativeTo})).map((entry) => {
            return mapObjectValues(entry, (key, filePath) => {
                return filePath && relative(packageRootDir, filePath);
            });
        });
    }

    itCases(testListChangedFiles, [
        {
            it: 'lists all changed files',
            input: {
                ref: testBranchNames.child,
                relativeTo: testCommits.parentAndChildMergeBase,
            },
            expect: [
                {
                    presentFilePath: 'test-file-to-edit',
                    pastFilePath: 'test-file-to-edit',
                },
                {
                    presentFilePath: 'test-file-to-rename-2',
                    pastFilePath: 'test-file-to-rename',
                },
            ],
        },
    ]);
});
