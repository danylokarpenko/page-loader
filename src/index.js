import Listr from 'listr';
import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import debugLib from 'debug';
import getLinks from './linksGetter';
import updateLinks from './htmlUpdater';
import processError from './error';

const debug = debugLib('pageloader-util');

const getFileName = (link, baseURL) => {
  const url = new URL(link, baseURL);
  const { dir, name, ext } = path.parse(url.pathname.slice(1));
  const fileName = path.join(dir, name);
  const normalizedName = fileName.replace(/[./]/g, '-');
  return `${normalizedName}${ext}`;
};

const getFolderName = (link, baseURL) => {
  const url = new URL(link, baseURL);
  const folderName = `${url.hostname}${url.pathname}`.replace(/[./]/g, '-');
  return folderName;
};

export default (pageUrl, dirpath) => {
  debug('Starting util', 'pageLoader');
  const pageFilePath = path.join(dirpath, `${getFolderName(pageUrl)}.html`);
  const srcDirPath = path.join(dirpath, `${getFolderName(pageUrl)}_files`);

  let data;

  const pageData = axios.get(pageUrl)
    .then((response) => {
      data = response.data;
      return data;
    })
    .then(() => fs.mkdir(srcDirPath))
    .then(() => {
      debug('Getting configs for request to local resources and form tasks');
      const links = getLinks(data);
      const tasks = links
        .map((link) => {
          debug(`Method GET to local link: ${link}`);
          return {
            title: `Method Get to local link: ${link}`,
            task: () => axios({
              method: 'get',
              url: link,
              baseURL: pageUrl,
              responseType: 'arraybuffer',
            })
              .then((response) => {
                debug(`Saving locally from ${link}`);

                const fileName = getFileName(link, pageUrl);
                return fs.writeFile(path.join(srcDirPath, fileName), response.data);
              }),
          };
        });
      debug('Returning promises of requesting tp local resources');
      return new Listr(tasks, { concurrent: true, exitOnError: false })
        .run()
        .catch((error) => ({ result: 'error', error }));
    })
    .then(() => {
      debug('Rewriting pageHtml');
      const updatedHtml = updateLinks(data, srcDirPath, pageUrl);
      return fs.writeFile(pageFilePath, updatedHtml);
    })
    .catch((error) => processError(error));
  debug(`End of request to ${pageUrl}`);
  return pageData;
};
