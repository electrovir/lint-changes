import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const packageRootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const testFilesDir = join(packageRootDir, 'test-files');
const goodFilesDir = join(testFilesDir, 'good');
const badFilesDir = join(testFilesDir, 'bad');

export const testPaths = {
    testFilesDir,
    goodFilesDir,
    badFilesDir,
    goodFile: join(goodFilesDir, 'good-lint-1.ts'),
    badFile: join(badFilesDir, 'bad-lint-1.ts'),
};
