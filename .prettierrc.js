import {basePrettierConfig} from 'virmator/base-configs/base-prettierrc.js';

/**
 * @typedef {import('prettier-plugin-multiline-arrays').MultilineArrayOptions} MultilineOptions
 *
 * @typedef {import('prettier').Options} PrettierOptions
 * @type {PrettierOptions & MultilineOptions}
 */
const prettierConfig = {
    ...basePrettierConfig,
};

export default prettierConfig;
