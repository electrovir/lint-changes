import {itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {relative} from 'node:path';
import {packageRootDir, testPaths} from '../repo-paths.mock.js';
import {lintFiles} from './lint-files.js';

describe(lintFiles.name, () => {
    async function testLintFiles(args: Omit<Parameters<typeof lintFiles>[0], 'cwd'>) {
        const output = await lintFiles({
            ...args,
            cwd: process.cwd(),
        });

        return output.map((entry) => {
            return {
                ...entry,
                filePath: relative(packageRootDir, entry.filePath),
            };
        });
    }

    itCases(testLintFiles, [
        {
            it: 'lints a single bad file',
            input: {
                filePaths: [testPaths.badFile],
                eslintArgString: '',
            },
            expect: [
                {
                    errorCount: 2,
                    fatalErrorCount: 0,
                    filePath: 'test-files/bad/bad-lint-1.ts',
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    messages: [
                        {
                            column: 8,
                            endColumn: 30,
                            endLine: 1,
                            line: 1,
                            message: "Async function 'doThing' has no 'await' expression.",
                            messageId: 'missingAwait',
                            nodeType: 'FunctionDeclaration',
                            ruleId: '@typescript-eslint/require-await',
                            severity: 2,
                        },
                        {
                            column: 9,
                            endColumn: 27,
                            endLine: 2,
                            line: 2,
                            message: "Do not use the '>' operator to compare against -0.",
                            messageId: 'unexpected',
                            nodeType: 'BinaryExpression',
                            ruleId: 'no-compare-neg-zero',
                            severity: 2,
                        },
                    ],
                    source: "export async function doThing() {\n    if (Math.random() > -0) {\n        return 'hi';\n    } else {\n        return 3;\n    }\n}\n",
                    suppressedMessages: [],
                    usedDeprecatedRules: [],
                    warningCount: 0,
                },
            ],
        },
        {
            it: 'lints a single good file',
            input: {
                filePaths: [testPaths.goodFile],
                eslintArgString: '',
            },
            expect: [
                {
                    errorCount: 0,
                    fatalErrorCount: 0,
                    filePath: 'test-files/good/good-lint-1.ts',
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    messages: [],
                    suppressedMessages: [],
                    usedDeprecatedRules: [],
                    warningCount: 0,
                },
            ],
        },
        {
            it: 'lints multiple files',
            input: {
                filePaths: [
                    testPaths.badFilesDir,
                    testPaths.goodFile,
                ],
                eslintArgString: '',
            },
            expect: [
                {
                    errorCount: 2,
                    fatalErrorCount: 0,
                    filePath: 'test-files/bad/bad-lint-1.ts',
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    messages: [
                        {
                            column: 8,
                            endColumn: 30,
                            endLine: 1,
                            line: 1,
                            message: "Async function 'doThing' has no 'await' expression.",
                            messageId: 'missingAwait',
                            nodeType: 'FunctionDeclaration',
                            ruleId: '@typescript-eslint/require-await',
                            severity: 2,
                        },
                        {
                            column: 9,
                            endColumn: 27,
                            endLine: 2,
                            line: 2,
                            message: "Do not use the '>' operator to compare against -0.",
                            messageId: 'unexpected',
                            nodeType: 'BinaryExpression',
                            ruleId: 'no-compare-neg-zero',
                            severity: 2,
                        },
                    ],
                    source: "export async function doThing() {\n    if (Math.random() > -0) {\n        return 'hi';\n    } else {\n        return 3;\n    }\n}\n",
                    suppressedMessages: [],
                    usedDeprecatedRules: [],
                    warningCount: 0,
                },
                {
                    errorCount: 2,
                    fatalErrorCount: 0,
                    filePath: 'test-files/bad/bad-lint-2.ts',
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    messages: [
                        {
                            column: 10,
                            endColumn: 18,
                            endLine: 3,
                            line: 3,
                            message: "'doThing2' is defined but never used.",
                            messageId: 'unusedVar',
                            // @ts-expect-error: we get `null` here, despite what the types claim
                            nodeType: null,
                            ruleId: '@typescript-eslint/no-unused-vars',
                            severity: 2,
                        },
                        {
                            column: 5,
                            endColumn: 15,
                            endLine: 4,
                            line: 4,
                            message:
                                'Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator.',
                            messageId: 'floatingVoid',
                            nodeType: 'ExpressionStatement',
                            ruleId: '@typescript-eslint/no-floating-promises',
                            severity: 2,
                            suggestions: [
                                {
                                    desc: 'Add void operator to ignore.',
                                    fix: {
                                        range: [
                                            68,
                                            68,
                                        ],
                                        text: 'void ',
                                    },
                                    messageId: 'floatingFixVoid',
                                },
                            ],
                        },
                    ],
                    source: "import {doThing} from './bad-lint-1.js';\n\nfunction doThing2() {\n    doThing();\n}\n",
                    suppressedMessages: [],
                    usedDeprecatedRules: [],
                    warningCount: 0,
                },
                {
                    errorCount: 0,
                    fatalErrorCount: 0,
                    filePath: 'test-files/good/good-lint-1.ts',
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    messages: [],
                    suppressedMessages: [],
                    usedDeprecatedRules: [],
                    warningCount: 0,
                },
            ],
        },
    ]);
});
