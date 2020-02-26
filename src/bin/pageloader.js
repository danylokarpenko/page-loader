#!/usr/bin/env node

import program from 'commander';
import pageload from '..';

program
  .description('Load page data.')
  .version('0.0.1', '-V, --version', 'output the current version');

program
  .arguments('<url>')
  .option('-o, --output [path]', 'choose path to output directory', process.cwd())
  .action((url, options) => {
    const outputPath = options.output;
    return pageload(url, outputPath)
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });

program.parse(process.argv);
