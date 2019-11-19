
import axios from 'axios';
import { promises as fs } from 'fs';
import _path from 'path';
import url from 'url';

const getFileName = (link) => {
  const { hostname, path } = url.parse(link);
  const name = `${hostname}${path}`.replace(/[./]/g, '-');
  return `${name}.html`;
};

export default (link, dirpath) => {
  const filePath = _path.join(dirpath, getFileName(link));

  return axios
    .get(link)
    .then((response) => {
      fs.writeFile(filePath, response.data);
    })
    .catch((err) => {
      throw err;
    });
};
