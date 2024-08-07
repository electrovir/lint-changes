import {wait} from '@augment-vir/common';
import {runCli} from '../cli/run-cli.js';
import {extractActionEnv} from './action-env.js';

async function runGithubAction() {
    /**
     * Wait because GitHub is slow to update, which causes race conditions with this action being
     * triggered and it reading the data.
     */
    await wait(2_000);

    const {eslintArgString, baseRef, repoDir, pastSetupCommand, debug} = extractActionEnv();

    await runCli({
        apiArgs: {
            baseRef,
            checkoutBaseRef: true,
            cwd: repoDir,
            pastSetupCommand,
            silent: false,
            debug,
        },
        eslintArgString,
    });
}

void runGithubAction();
