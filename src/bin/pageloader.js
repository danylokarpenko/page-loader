#!/usr/bin/env node

import program from 'commander';
import pageload from '..';

program
  .description('Load page data.')
  .version('0.0.1', '-V, --version', 'output the current version');

program
  .option('-o, --output [path]', 'choose path to output directory', 'Current directory')
  .arguments('<url>')
  .action((url, options) => {
    const outputPath = options.output;
    pageload(url, outputPath);
    console.log('URL: ', url);
    console.log('output path: ', options.output);
  });

program.parse(process.argv);
