#!/usr/bin/env node

import program from 'commander';
import pageload from '..';

program
  .description('Load page data.')
  .version('0.0.1', '-V, --version', 'output the current version');

program
  .arguments('<url>')
  .option('-o, --output [path]', 'choose path to output directory', 'Current directory')
  .action((url, options) => {
    const outputPath = options.output;
    pageload(url, outputPath).catch(console.log);
  });

program.parse(process.argv);
