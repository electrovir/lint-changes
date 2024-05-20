#!/usr/bin/env node

import {fileURLToPath} from 'node:url';
import {parseCliArgs} from './parse-cli-args.js';
import {runCli} from './run-cli.js';

void runCli(parseCliArgs(process.argv, fileURLToPath(import.meta.url)));
