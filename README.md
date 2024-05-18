# lint-changes

A CLI, API, and GitHub Action for running ESLint only on changed files. The GitHub Action also automatically compares the current branch against its base branch.

# GitHub Action

Use this GitHub Action in a pull request or push trigger via `electrovir/lint-changes@latest`. The action has two inputs:

-   `eslintArgs`: a single string of args to pass to ESLint.
    example: `--config configs/my-eslint.config.js`
-   `pastSetupCommand`: the command needed to setup your repo's past state for linting. Defaults to just `npm ci`.
    example: `npm ci && npm run compile`

## GitHub Action example

```yml
name: Lint changes

on:
    pull_request:
        branches:
            - '**'

# this lint script is relatively expensive, so it's a good idea to cancel concurrent runs
concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

jobs:
    lint-changes:
        name: Lint Changes
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4.1.1
              with:
                  # Fetch the whole git tree so the action can checkout the base ref.
                  fetch-depth: 0
            - uses: electrovir/lint-changes@latest
              with:
                  # Neither of this inputs are required, these are just examples of how to assign them.
                  eslintArgs: '--config configs/my-eslint.config.js'
                  pastSetupCommand: 'npm ci && npm run compile'
```

# CLI

You can use this package via your CLI:

1. install via npm: `npm i lint-changes`
2. run the command: `lint-changes`

## CLI args

The CLI args are the same as the API args (listed here: http://electrovir.github.io/lint-changes/variables/apiArgsShape.html). Each arg should be prefixed with `--` and use `=<value>` for assignment. Like this: `--checkoutBaseRef=true` or `--baseRef=main`.

Any other arguments not expected by this API are passed directly to ESLint.

# API

You can use this package programmatically:

1. install via npm: `npm i lint-changes`
2. use the exposed API:

    ```typescript
    import {lintChanges} from 'lint-changes';

    await lintChanges();
    ```

For documentation on the API's inputs, outputs, and other exposed functions, see the full docs here: http://electrovir.github.io/lint-changes/functions/lintChanges.html
