import nock from 'nock';
import os from 'os';
import _path from 'path';
import { promises as fs } from 'fs';
import url from 'url';
import pageload from '../src';

const getFixturePath = (filename) => `${__dirname}/__fixtures__/${filename}`;

const getFileName = (link) => {
  const { host, path } = url.parse(link);
  const name = `${host}${path}`.replace(/[./]/g, '-');
  return `${name}.html`;
};

const link = 'https://hexlet.io/courses';
let newDirpath;
let nockBody;
beforeEach(async () => {
  newDirpath = await fs.mkdtemp(_path.join(os.tmpdir(), '/'));

  nockBody = await fs.readFile(getFixturePath('hexlet-io-courses.html'), 'utf-8');
});

nock.disableNetConnect();

test('pageload save data', async () => {
  const scope = nock('https://hexlet.io')
    .get('/courses')
    .reply(200, nockBody);

  await pageload(link, newDirpath);

  const loadedData = await fs.readFile(_path.join(newDirpath, getFileName(link)), 'utf-8');

  expect(scope.isDone()).toBeTruthy();
  expect(loadedData).toBe(nockBody);
});

afterEach(async () => {
  await fs.rmdir(newDirpath, { recursive: true });
});
