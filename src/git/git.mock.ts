import {RemoveFirstTupleEntry, TypedFunction} from '@augment-vir/common';
import simpleGit, {SimpleGit} from 'simple-git';
import {packageRootDir} from '../repo-paths.mock';

export type GitFunction = TypedFunction<[SimpleGit, ...any[]], any>;

export function wrapInGit<const T extends GitFunction>(
    functionToTest: T,
): TypedFunction<RemoveFirstTupleEntry<Parameters<T>>, ReturnType<T>> {
    return ((...args: RemoveFirstTupleEntry<Parameters<T>>): unknown => {
        return callWithGit(functionToTest, ...args);
    }) as TypedFunction<RemoveFirstTupleEntry<Parameters<T>>, ReturnType<T>>;
}

export function callWithGit<const T extends GitFunction>(
    functionToTest: T,
    ...args: RemoveFirstTupleEntry<Parameters<T>>
): ReturnType<T> {
    const git = simpleGit(packageRootDir);

    return functionToTest(git, ...args) as ReturnType<T>;
}
