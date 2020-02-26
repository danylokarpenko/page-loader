import nock from 'nock';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import debug from 'debug';
import pageload from '../src';

const getFixturePath = (filename) => `${__dirname}/__fixtures__/${filename}`;

const link = 'https://hexlet.io/courses';
let distPath;
let nockBody;

beforeEach(async () => {
  distPath = await fs.mkdtemp(path.join(os.tmpdir(), 'loader-'));
  nockBody = await fs.readFile(getFixturePath('hexlet-io-courses.html'), 'utf-8');
  debug.enable('pageloader-util');
});

nock.disableNetConnect();

test('Successful page loading', async () => {
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, nockBody);
  nock('https://hexlet.io')
    .get('/courses/file1')
    .reply(404, 'Response from google');
  nock('https://hexlet.io')
    .get('/courses/file2.js')
    .reply(200, 'Response from ebay');


  await pageload(link, distPath);

  const htmlBeforeSavingResources = await fs.readFile(getFixturePath('hexlet-io-courses.html'));
  const pageHtmlPath = path.join(distPath, 'hexlet-io-courses.html');
  const loadedHtmlData = await fs.readFile(pageHtmlPath);

  const sourceDirPath = path.join(distPath, 'hexlet-io-courses_files');
  const sources = await fs.readdir(sourceDirPath);

  expect(loadedHtmlData).toBeTruthy();
  expect(loadedHtmlData).not.toBe(htmlBeforeSavingResources);

  expect(sources.length).toBe(1);
  expect(sources.includes('file1')).toBeFalsy();
  expect(sources.includes('file2.js')).toBeTruthy();
});

test('Must throw 404 error', async () => {
  nock('https://hexlet.io')
    .get('/courses')
    .replyWithError({
      message: 'Error: Request failed with status code 404',
      code: 'NOT_FOUND',
    });

  await expect(pageload(link, distPath)).rejects.toThrow('404');
});

test('Must throw ENOENT error', async () => {
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, nockBody);

  await expect(pageload(link, 'unknownPath')).rejects.toThrow('ENOENT');
});
