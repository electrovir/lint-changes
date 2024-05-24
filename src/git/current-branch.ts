import {SimpleGit} from 'simple-git';

export async function getCurrentBranch(git: Readonly<SimpleGit>): Promise<string> {
    const gitArgs = [
        'rev-parse',
        '--abbrev-ref',
        'HEAD',
    ];
    const gitOutput = await git.raw(gitArgs);

    return gitOutput.trim();
}
