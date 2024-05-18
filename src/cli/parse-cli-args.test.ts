import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {apiArgsShape} from '../api/api-args';
import {parseCliArgs} from './parse-cli-args';

describe(parseCliArgs.name, () => {
    itCases(parseCliArgs, [
        {
            it: 'uses default api args when nothing is passed in',
            inputs: [
                [],
                'cli.ts',
            ],
            expect: {
                apiArgs: apiArgsShape.defaultValue,
                eslintArgString: '',
            },
        },
        {
            it: 'passes all unknown arguments to ESLint',
            inputs: [
                [
                    '--config',
                    'eslint.config.js',
                ],
                'cli.ts',
            ],
            expect: {
                apiArgs: apiArgsShape.defaultValue,
                eslintArgString: '--config eslint.config.js',
            },
        },
        {
            it: 'passes known boolean arguments to ESLint',
            inputs: [
                [
                    '--config',
                    'eslint.config.js',
                    '--checkoutBaseRef',
                ],
                'cli.ts',
            ],
            expect: {
                apiArgs: {
                    ...apiArgsShape.defaultValue,
                    checkoutBaseRef: true,
                },
                eslintArgString: '--config eslint.config.js',
            },
        },
        {
            it: 'passes known value arguments to ESLint',
            inputs: [
                [
                    '--config',
                    'eslint.config.js',
                    '--checkoutBaseRef',
                    '--baseRef=fake-branch',
                ],
                'cli.ts',
            ],
            expect: {
                apiArgs: {
                    ...apiArgsShape.defaultValue,
                    checkoutBaseRef: true,
                    baseRef: 'fake-branch',
                },
                eslintArgString: '--config eslint.config.js',
            },
        },
    ]);
});
