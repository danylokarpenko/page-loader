import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import url from 'url';
import pageload from '../src';
import debug from 'debug';

const getFixturePath = (filename) => `${__dirname}/__fixtures__/${filename}`;

const getFileName = (link) => {
  const { host, path: pathname } = url.parse(link);
  const name = `${host}${pathname}`.replace(/[./]/g, '-');
  return `${name}.html`;
};

const getName = (link) => {
  const { hostname, path } = url.parse(link);
  const name = `${hostname}${path}`.replace(/[./]/g, '-');
  return name;
};

const link = 'https://hexlet.io/courses';
let distPath;
let nockBody;

beforeEach(async () => {
  distPath = await fs.mkdtemp(path.join(os.tmpdir(), 'loader-'));
  nockBody = await fs.readFile(getFixturePath('hexlet-io-courses.html'), 'utf-8');
  debug.enable('pageloader-util');
});

nock.disableNetConnect();

test('pageload save data', async () => {
  const scope = nock('https://hexlet.io')
    .get('/courses')
    .reply(200, nockBody);
  const scope2 = nock('https://hexlet.io')
    .get('/courses/file1')
    .reply(200, 'Response from google');
  const scope3 = nock('https://hexlet.io')
    .get('/courses/file2.js')
    .reply(200, 'Response from ebay');


  await pageload(link, distPath);

  const pageHtmlPath = path.join(distPath, `${getName(link)}.html`);
  const isExists = await fs.readFile(pageHtmlPath);

  const sourceDirPath = path.join(distPath, `${getName(link)}_files`);
  const sources = await fs.readdir(sourceDirPath);

  expect(scope.isDone()).toBeTruthy();
  expect(scope2.isDone()).toBeTruthy();
  expect(isExists).toBeTruthy();

  expect(sources.length).toBe(2);
  expect(sources.includes('file1')).toBeTruthy();
  expect(sources.includes('file2.js')).toBeTruthy();
});

afterEach(async () => {
  await fs.rmdir(distPath, { recursive: true });
  debug.disable();
});
