#!/usr/bin/env node

import {fileURLToPath} from 'node:url';
import {parseCliArgs} from './parse-cli-args';
import {runCli} from './run-cli';

void runCli(parseCliArgs(process.argv, fileURLToPath(import.meta.url)));
