import getRequestConfigs from './configFetcher.js';
import updateLinks from './htmlUpdater.js';
import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';

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
  const pageFilePath = path.join(dirpath, `${getFolderName(pageUrl)}.html`);
  const srcDirPath = path.join(dirpath,`${getFolderName(pageUrl)}_files`);

  const pageData = axios.get(pageUrl)
  .then((response) => fs.writeFile(pageFilePath, response.data))
  .then(() => fs.mkdir(srcDirPath))
  .then(() => fs.readFile(pageFilePath))
  .then((data) => {
    const configs = getRequestConfigs(data, pageUrl);

    const promises = configs
      .map((config) => axios(config)
        .then((response) => ({result: 'success', response, url: config.url}))
        .catch((e) => ({result: 'error', error: e}))
      );

    return Promise.all(promises);
  })
  .then((values) => {
    const promises = values
      .filter((value) => value.result === 'success')
      .map((value) => {
        const fileName = getFileName(value.url);

        return fs.writeFile(path.join(srcDirPath, fileName), value.response.data)
        .then((d) => ({ result: 'success', data: d }))
        .catch((e) => ({ result: 'error', error: e }))
      });

    return Promise.all(promises);
  })
  .then(() => fs.readFile(pageFilePath))
  .then((data) => {
    const updatedHtml = updateLinks(data, srcDirPath);
    return fs.writeFile(pageFilePath, updatedHtml);
  })

  return pageData;
}
