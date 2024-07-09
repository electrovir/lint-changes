import {defineShape} from 'object-shape-tester';

/**
 * Shape definition for the args expected by the API.
 *
 * When assigning these via the CLI, prefix the var name with `--` and use `=<value>` to assign
 * them. Like this: `--checkoutBaseRef=true` or `--baseRef=main`.
 *
 * @category API
 */
export const apiArgsShape = defineShape({
    /**
     * If set to true, the lint command will attempt to checkout the changes base ref in order to
     * lint it independently. Typically this is only done in CI environments, as doing so locally
     * means you cannot edit any files while the process is running.
     *
     * If `CI` is set to true, this will automatically be set to `true`.
     *
     * @default false
     */
    checkoutBaseRef: false,
    /**
     * The git ref from which to calculate a merge base with the current HEAD. This merge base is
     * then used for calculating all "changes" to lint. Meaning, any file changes after that merge
     * base are counted as changes for linting.
     *
     * If this value is not provided it will be determined in the following ways: - GitHub Actions:
     * determined from the pull request merge target - API or CLI: determined by finding the most
     * recent commit that is contained within a branch that does not contain the current git HEAD.
     *
     * @default ''
     */
    baseRef: '',
    /**
     * Set to `true` for extra logging. Set to `false` to turn off the extra logging.
     *
     * @default true
     */
    debug: true,
    /** Remove all non-error logging. */
    silent: false,
    /**
     * This command, whatever it is, will be run when the base ref is checked out for comparison
     * linting. This only has any effect if `checkoutBaseRef` is set to `true`.
     *
     * @default 'npm ci'
     */
    pastSetupCommand: 'npm ci',
    /**
     * The directory within all commands will be run.
     *
     * @default process.cwd()
     */
    cwd: process.cwd(),
});

/**
 * The args expected by this package's API. See {@link apiArgsShape} for the list of properties.
 *
 * @category API
 */
export type ApiArgs = typeof apiArgsShape.runTimeType;
