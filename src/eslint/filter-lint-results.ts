import {
    assertLengthAtLeast,
    groupArrayBy,
    isLengthAtLeast,
    isTruthy,
    mapObjectValues,
} from '@augment-vir/common';
import type {ESLint, Linter} from 'eslint';
import {assertDefined} from 'run-time-assertions';

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
    originalResults: TimeComparison<ReadonlyArray<Readonly<ESLint.LintResult>>>,
): ESLint.LintResult[] {
    const byFile = mapObjectValues(originalResults, (key, lintResults) =>
        groupResultsByFile(lintResults),
    );

    const filtered: {[FilePath in string]: ESLint.LintResult} = mapObjectValues(
        byFile.present,
        (filePath, presentResults): ESLint.LintResult => {
            const assertionFailureMessage = `Somehow there are no present lint results for '${filePath}'`;
            assertDefined(presentResults, assertionFailureMessage);
            assertLengthAtLeast(presentResults, 1, assertionFailureMessage);
            if (presentResults.length > 1) {
                throw new Error(
                    `Somehow there are multiple present lint results for '${filePath}'`,
                );
            }

            const pastResults = byFile.past[filePath];

            /** No need to filter results if there are no past results. */
            if (!pastResults || !isLengthAtLeast(pastResults, 1)) {
                return presentResults[0];
            }

            if (pastResults.length > 1) {
                throw new Error(`Somehow there are multiple past lint results for '${filePath}'`);
            }

            return removeDuplicateMessages({past: pastResults[0], present: presentResults[0]});
        },
    );

    return Object.values(filtered);
}

function groupResultsByFile(
    results: ReadonlyArray<Readonly<ESLint.LintResult>>,
): Partial<Record<string, ESLint.LintResult[]>> {
    return groupArrayBy(results, (result) => result.filePath);
}

function removeDuplicateMessages(
    results: TimeComparison<Readonly<ESLint.LintResult>>,
): ESLint.LintResult {
    const messages: TimeComparison<{[messageKey in string]?: Linter.LintMessage[]}> =
        mapObjectValues(results, (key, value) => groupMessages(value.messages));

    const filteredKeyedMessages = mapObjectValues(
        messages.present,
        (messageId, presentMessages) => {
            if (!presentMessages) {
                return undefined;
            }
            const pastMessages = messages.past[messageId];
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
