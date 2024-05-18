import jsEslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettierEslintRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import tsEslint from 'typescript-eslint';

export default [
    jsEslint.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    prettierEslintRecommended,
    {
        languageOptions: {
            parserOptions: {
                project: [
                    join(
                        dirname(fileURLToPath(import.meta.url)),
                        'configs',
                        'tsconfig.eslint.json',
                    ),
                ],
            },
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            'no-undef': 'error',
            'prettier/prettier': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/await-thenable': 'error',
            '@stylistic/padding-line-between-statements': [
                'error',
                /** Require new lines between imports and everything else. */
                {
                    blankLine: 'always',
                    prev: 'import',
                    next: '*',
                },
                /** Do not require new lines between imports and other imports. */
                {
                    blankLine: 'any',
                    prev: 'import',
                    next: 'import',
                },
            ],
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
            'no-console': [
                'error',
                {
                    allow: [
                        'info',
                        'error',
                        'warn',
                    ],
                },
            ],
        },
    },
    {
        files: [
            '**/*.js',
            '**/*.cjs',
        ],
        ...tsEslint.configs.disableTypeChecked,
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
];
