import {getInput} from '@actions/core';
import {context as githubContext} from '@actions/github';
import {existsSync} from 'node:fs';

export function extractActionEnv(): {
    eslintArgString: string;
    repoDir: string;
    pastSetupCommand: string;
    baseRef: string;
} {
    const repoDir = process.env.GITHUB_WORKSPACE;
    if (!repoDir || !existsSync(repoDir)) {
        throw new Error(`Invalid repo dir: '${String(repoDir)}'`);
    }
    const baseRef =
        (githubContext.payload.pull_request?.base as {ref: string} | undefined)?.ref || '';

    const pastSetupCommand: string = getInput('token', {trimWhitespace: true}) || 'npm ci';
    const eslintArgString: string = getInput('eslintArgs', {trimWhitespace: true});

    return {
        repoDir,
        pastSetupCommand,
        eslintArgString,
        baseRef,
    };
}
