import {
    assertLengthAtLeast,
    filterMap,
    groupArrayBy,
    isLengthAtLeast,
    isTruthy,
    mapObjectValues,
} from '@augment-vir/common';
import {logIf} from '@augment-vir/node-js';
import type {ESLint, Linter} from 'eslint';
import {basename} from 'path';
import {ChangedFile} from '../git/changes.js';

/**
 * An object with both past and present results of arbitrary type `T`.
 *
 * @category Internal
 */
export type TimeComparison<T> = {
    past: T;
    present: T;
};

/**
 * Filters present lint results to only the messages that are new.
 *
 * @category Internal
 */
export function filterLintResults(
    originalResults: Readonly<TimeComparison<ReadonlyArray<Readonly<ESLint.LintResult>>>>,
    changedFiles: ReadonlyArray<Readonly<ChangedFile>>,
    debug: boolean,
): ESLint.LintResult[] {
    const byFile = mapObjectValues(originalResults, (key, lintResults) =>
        groupResultsByFile(lintResults),
    );

    const filtered: ESLint.LintResult[] = filterMap(
        changedFiles,
        (changedFile): ESLint.LintResult | undefined => {
            const baseFileName = basename(changedFile.presentFilePath);
            const presentLintResults = byFile.present[changedFile.presentFilePath];
            const pastLintResults = changedFile.pastFilePath
                ? byFile.past[changedFile.pastFilePath]
                : undefined;

            /**
             * Not being able to find any lint results here would indicate that the file was ignored
             * by ESLint.
             */
            if (!presentLintResults) {
                logIf.info(debug, `No present lint results for '${baseFileName}'.`);
                return undefined;
            }

            assertLengthAtLeast(
                presentLintResults,
                1,
                `Somehow there are no present lint results for '${changedFile.presentFilePath}'`,
            );
            if (presentLintResults.length > 1) {
                throw new Error(
                    `Somehow there are multiple present lint results for '${changedFile.presentFilePath}'`,
                );
            }

            /** No need to filter results if there are no past results. */
            if (!pastLintResults || !isLengthAtLeast(pastLintResults, 1)) {
                logIf.info(debug, `No past lint results for '${baseFileName}'.`);
                return presentLintResults[0];
            }

            if (pastLintResults.length > 1) {
                throw new Error(
                    `Somehow there are multiple past lint results for '${changedFile.pastFilePath}'`,
                );
            }

            logIf.info(debug, `Removing duplicate messages for '${baseFileName}'.`);

            return removeDuplicateMessages(
                {
                    past: pastLintResults[0],
                    present: presentLintResults[0],
                },
                debug,
            );
        },
        isTruthy,
    );

    return filtered;
}

function groupResultsByFile(
    results: ReadonlyArray<Readonly<ESLint.LintResult>>,
): Partial<Record<string, ESLint.LintResult[]>> {
    return groupArrayBy(results, (result) => result.filePath);
}

function removeDuplicateMessages(
    results: TimeComparison<Readonly<ESLint.LintResult>>,
    debug: boolean,
): ESLint.LintResult {
    const messages: TimeComparison<{[messageKey in string]?: Linter.LintMessage[]}> =
        mapObjectValues(results, (key, value) => groupMessages(value.messages));
    if (debug) {
        const messageCounts: TimeComparison<Record<string, number>> = mapObjectValues(
            messages,
            (time, timeMessages) => {
                return mapObjectValues(timeMessages, (messageKey, messages) => {
                    return messages?.length || 0;
                });
            },
        );
        console.info(JSON.stringify(messageCounts, null, 4));
    }

    const filteredKeyedMessages = mapObjectValues(
        messages.present,
        (messageKey, presentMessages) => {
            if (!presentMessages) {
                return undefined;
            }
            const pastMessages = messages.past[messageKey];
            if (!pastMessages || !pastMessages.length) {
                return presentMessages;
            }

            return presentMessages.slice(pastMessages.length);
        },
    );

    const finalMessages = Object.values(filteredKeyedMessages).flat().filter(isTruthy);

    return {
        ...results.present,
        messages: finalMessages,
        errorCount: finalMessages.filter((message) => message.severity === 2).length,
        fatalErrorCount: finalMessages.filter((message) => message.fatal).length,
        fixableErrorCount: finalMessages.filter((message) => message.severity === 2 && message.fix)
            .length,
        fixableWarningCount: finalMessages.filter(
            (message) => message.severity === 1 && message.fix,
        ).length,
        warningCount: finalMessages.filter((message) => message.severity === 1).length,
    };
}

function groupMessages(messages: ReadonlyArray<Readonly<Linter.LintMessage>>): {
    [messageKey in string]?: Linter.LintMessage[];
} {
    return groupArrayBy(messages, (message) =>
        [
            message.ruleId,
            message.messageId,
        ]
            .filter(isTruthy)
            .join(':'),
    );
}
