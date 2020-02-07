import getRequestConfigs from './configFetcher.js';
import updateLinks from './htmlUpdater.js';
import processError from './error.js';
import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import debugLib from 'debug';

const debug = debugLib('pageloader-util');

const getFileName = (link) => {
  const { hostname, pathname } = url.parse(link);
  const { dir, name, ext } = path.parse(pathname.slice(1));
  const fileName = hostname ? path.join(hostname, dir, name) : path.join(dir, name);
  const normalizedName = fileName.replace(/[./]/g, '-');
  return `${normalizedName}${ext}`
};

const getFolderName = (link) => {
  const { hostname, pathname } = url.parse(link);
  const folderName = `${hostname}${pathname}`.replace(/[./]/g, '-');
  return folderName;
}

export default (pageUrl, dirpath) => {
  debug('Starting util', 'pageLoader');
  const pageFilePath = path.join(dirpath, `${getFolderName(pageUrl)}.html`);
  const srcDirPath = path.join(dirpath,`${getFolderName(pageUrl)}_files`);

  const pageData = axios.get(pageUrl)
  .then((response) => fs.writeFile(pageFilePath, response.data))
  .then(() => fs.mkdir(srcDirPath))
  .then(() => fs.readFile(pageFilePath))
  .then((data) => {
    debug('Read html data');
    const configs = getRequestConfigs(data, pageUrl);

    const promises = configs
      .map((config) => {
        debug(config.method + ' ' + config.url);
        return axios(config)
        .then((response) => ({result: 'success', response, url: config.url}))
        .catch((e) => ({result: 'error', error: e}))
      });

    return Promise.all(promises);
  })
  .then((values) => {
    const promises = values
      .filter((value) => value.result === 'success')
      .map((value) => {
        debug(value.result + ' ' + value.url)
        const fileName = getFileName(value.url);

        return fs.writeFile(path.join(srcDirPath, fileName), value.response.data)
        .then((d) => ({ result: 'success', data: d }))
        .catch((e) => ({ result: 'error', error: e }))
      });

    debug('saving local files');

    return Promise.all(promises);
  })
  .then(() => fs.readFile(pageFilePath))
  .then((data) => {
    const updatedHtml = updateLinks(data, srcDirPath);
    debug('rewriting pageHtml');
    return fs.writeFile(pageFilePath, updatedHtml);
  })
  .catch((error) => processError(error.message, error.fileName, error.lineNumber))

  return pageData;
}
