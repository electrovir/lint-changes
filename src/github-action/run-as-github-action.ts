import {wait} from '@augment-vir/common';
import {runCli} from '../cli/run-cli';
import {extractActionEnv} from './action-env';

async function runGithubAction() {
    /**
     * Wait because GitHub is slow to update, which causes race conditions with this action being
     * triggered and it reading the data.
     */
    await wait(2_000);

    const {eslintArgString, baseRef, repoDir, pastSetupCommand} = extractActionEnv();

    await runCli({
        apiArgs: {
            baseRef,
            checkoutBaseRef: true,
            cwd: repoDir,
            pastSetupCommand,
            silent: false,
        },
        eslintArgString,
    });
}

void runGithubAction();
