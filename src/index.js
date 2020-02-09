import Listr from 'listr';
import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import debugLib from 'debug';
import getRequestConfigs from './configFetcher';
import updateLinks from './htmlUpdater';
import processError from './error';

const debug = debugLib('pageloader-util');

const getFileName = (link) => {
  const { hostname, pathname } = url.parse(link);
  const { dir, name, ext } = path.parse(pathname.slice(1));
  const fileName = hostname ? path.join(hostname, dir, name) : path.join(dir, name);
  const normalizedName = fileName.replace(/[./]/g, '-');
  return `${normalizedName}${ext}`;
};

const getFolderName = (link) => {
  const { hostname, pathname } = url.parse(link);
  const folderName = `${hostname}${pathname}`.replace(/[./]/g, '-');
  return folderName;
};

export default (pageUrl, dirpath) => {
  debug('Starting util', 'pageLoader');
  const pageFilePath = path.join(dirpath, `${getFolderName(pageUrl)}.html`);
  const srcDirPath = path.join(dirpath, `${getFolderName(pageUrl)}_files`);

  let tasks;

  const pageData = axios.get(pageUrl)
    .then((response) => fs.writeFile(pageFilePath, response.data))
    .then(() => fs.mkdir(srcDirPath))
    .then(() => fs.readFile(pageFilePath))
    .then((data) => {
      debug('Read html data');
      const configs = getRequestConfigs(data, pageUrl);

      tasks = configs
        .map((config) => {
          debug(`Method ${config.method} to local link: ${config.url}`);
          return {
            title: `Method ${config.method} to local link: ${config.url}`,
            task: () => {
              return axios(config)
                .then((response) => {
                  debug(`Saving locally from ${config.url}`);

                  const fileName = getFileName(config.url);
                  return fs.writeFile(path.join(srcDirPath, fileName), response.data);
                });
            },
          };
        });

      return tasks;
    })
    .then(() => fs.readFile(pageFilePath))
    .then((data) => {
      debug('Rewriting pageHtml');
      const updatedHtml = updateLinks(data, srcDirPath);
      return fs.writeFile(pageFilePath, updatedHtml);
    })
    .then(() => {
      debug('Returning promises')
      return new Listr(tasks, { concurrent: true, exitOnError: false }).run().catch((error) => {error});
    })
    .catch((error) => processError(error));

  return pageData;
};
