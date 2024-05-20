import {
    assertLengthAtLeast,
    collapseWhiteSpace,
    filterMap,
    isEnumValue,
    isTruthy,
} from '@augment-vir/common';
import {join} from 'node:path';
import {assertDefined} from 'run-time-assertions';
import {SimpleGit} from 'simple-git';
import {getCurrentGitRepoPath} from './repo-path.js';

/**
 * File paths for a file that has been modified in some way since the base ref.
 *
 * @category Internal
 */
export type ChangedFile = {
    latestFilePath: string;
    previousFilePath?: string | undefined;
};

/**
 * Lists all the changed files, according to git, between the given refs.
 *
 * @category Internal
 */
export async function listChangedFiles(
    git: Readonly<SimpleGit>,
    {
        ref,
        relativeTo,
    }: {
        ref: string;
        relativeTo: string;
    },
): Promise<ChangedFile[]> {
    const gitArgs = [
        'diff',
        '--name-status',
        relativeTo,
        ref,
    ];

    const diffOutput = await git.raw(gitArgs);

    const gitRepoPath = await getCurrentGitRepoPath(git);

    const changedFiles = filterMap(
        diffOutput.split('\n'),
        (line) => parseDiffLine({line, gitRepoPath}),
        isTruthy,
    );

    return changedFiles;
}

function parseDiffLine({
    line,
    gitRepoPath,
}: {
    line: string;
    gitRepoPath: string;
}): ChangedFile | undefined {
    const trimmed = collapseWhiteSpace(line);

    if (!trimmed) {
        return undefined;
    }

    const columns = filterMap(trimmed.split(' '), (column) => column.trim(), isTruthy);

    assertLengthAtLeast(columns, 2, `Failed to parse diff line: '${line}'`);

    const status = columns[0][0]?.toLowerCase();

    if (!isEnumValue(status, NameStatus)) {
        throw new Error(`Unexpected git name status '${status}' on line '${line}'.`);
    }

    if (status === NameStatus.Renamed) {
        assertDefined(columns[2], `Failed to find new file name in line '${line}'`);

        return {
            latestFilePath: join(gitRepoPath, columns[2]),
            previousFilePath: join(gitRepoPath, columns[1]),
        };
    } else {
        return {
            latestFilePath: join(gitRepoPath, columns[1]),
        };
    }
}

/**
 * From the docs here:
 * https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---diff-filterACDMRTUXB82308203
 */
enum NameStatus {
    Added = 'a',
    Copied = 'c',
    Deleted = 'd',
    Modified = 'm',
    Renamed = 'r',
    TypeChanged = 't',
    TypeUnmerged = 'u',
    TypeUnknown = 'x',
    PairingBroken = 'b',
}
