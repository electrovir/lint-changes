import {copyThroughJson, hasKey, removePrefix, typedSplit} from '@augment-vir/common';
import {extractRelevantArgs} from 'cli-args-vir';
import {assertValidShape} from 'object-shape-tester';
import {assertRunTimeType, getRunTimeType} from 'run-time-assertions';
import {ApiArgs, apiArgsShape} from '../api/api-args';

/**
 * Parse a raw array of CLi args into the internally expected arguments object.
 *
 * @category Internal
 */
export function parseCliArgs(
    rawArgs: ReadonlyArray<string>,
    scriptFileName: string,
): {
    apiArgs: ApiArgs;
    eslintArgString: string;
} {
    const relevantArgs = extractRelevantArgs({
        rawArgs,
        binName: 'lint-changes',
        fileName: scriptFileName,
        errorIfNotFound: false,
    });

    const apiArgs: Record<keyof ApiArgs, any> = copyThroughJson(apiArgsShape.defaultValue);

    const eslintArgs = relevantArgs.filter((arg) => {
        const {name, value} = parseArg(arg);

        if (hasKey(apiArgs, name)) {
            const defaultValue = apiArgsShape.defaultValue[name];

            assertRunTimeType(
                value,
                getRunTimeType(defaultValue),
                `Invalid value type '${getRunTimeType(value)}' for arg '${name}': expected '${getRunTimeType(defaultValue)}'`,
            );

            apiArgs[name] = value;
            /** Omit this argument from the `eslintArgs` if we recognize it as an api argument. */
            return false;
        } else {
            return true;
        }
    });

    assertValidShape(apiArgs, apiArgsShape);

    return {apiArgs, eslintArgString: eslintArgs.join(' ')};
}

function parseArg(arg: string): {arg: string; name: string; value: string | boolean} {
    const [
        name,
        rawValue,
    ] = typedSplit(removePrefix({value: arg, prefix: '--'}), '=');

    if (rawValue) {
        const value =
            rawValue.toLowerCase() === 'true'
                ? true
                : rawValue.toLowerCase() === 'false'
                  ? false
                  : rawValue;

        return {arg, name, value};
    } else {
        return {
            arg,
            name,
            value: true,
        };
    }
}
