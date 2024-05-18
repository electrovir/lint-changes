import {log} from '@augment-vir/node-js';
import {lintChanges} from '../api/api';
import {ApiArgs} from '../api/api-args';
import {formatLintResults} from '../api/format-results';

/**
 * Runs the CLI.
 *
 * @category CLI
 * @returns `true` if ESLint passes. Otherwise, `false`.
 */
export async function runCli(
    args: {apiArgs: ApiArgs; eslintArgString: string},
    /**
     * Set to `true` to prevent this function from calling `process.exit` when there's an error or
     * failure.
     */
    omitExit = false,
): Promise<boolean> {
    try {
        const lintResults = await lintChanges(args.apiArgs, args.eslintArgString);

        const formattedResults = await formatLintResults(args.apiArgs.cwd, lintResults);

        if (formattedResults) {
            process.stdout.write(formattedResults);

            const hasErrors = lintResults.some((result) => !!result.errorCount);

            if (hasErrors) {
                if (!omitExit) {
                    process.exit(1);
                }
                return false;
            }
        }

        return true;
    } catch (error) {
        log.error(error);
        if (!omitExit) {
            process.exit(1);
        }
        return false;
    }
}
