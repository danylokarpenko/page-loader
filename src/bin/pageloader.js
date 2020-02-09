#!/usr/bin/env node

import Listr from 'listr';
import program from 'commander';
import pageload from '..';

program
  .description('Load page data.')
  .version('0.0.1', '-V, --version', 'output the current version');

program
  .arguments('<url>')
  .option('-o, --output [path]', 'choose path to output directory', __dirname)
  .action((url, options) => {
    const outputPath = options.output;
    console.log(outputPath);
    return pageload(url, outputPath)
      .then((promises) => {
        const wrapedTasks = promises.map((promise) => ({
          title: 'Downloading resource',
          task: () => promise,
        }));
        const tasks = new Listr(wrapedTasks, { concurrent: true, exitOnError: false });
        return tasks.run().catch(console.error);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });

program.parse(process.argv);
