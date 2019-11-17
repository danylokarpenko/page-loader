import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const getFileName = (link) => {
  const { host, path } = url.parse(link);
  const name = `${host}${path}`.replace(/\//g, '-').replace(/\./g, '-');
  return `${name}.html`;
}

const saveData = (link, dest) => {
  const filePath = path.join(dest, getFileName(link));
  return axios
    .get(link)
    .then((response) => {
      fs.writeFile(filePath, response);
    })
    .catch(console.log);
}

// saveData('https://soundcloud.com', '/tmp');
