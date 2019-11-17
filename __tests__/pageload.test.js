import nock from 'nock';
import os from 'os';
import path from 'path';
import fs from 'fs';
import url from 'url';
import pageload from '../src';

const getFixturePath = (filename) => `${__dirname}/__fixtures__/${filename}`;

let outDirpath;
let fullFilePath;
const link = 'https://hexlet.io/courses';

beforeEach(async () => {
  outDirpath = os.tmpdir();
  const fileName = 'hexlet-io-courses.html';
  fullFilePath = path.join(tmpDir, fileName);

})

nock.disableNetConnect();

test('pageload save data', async () => {
  const scope = nock(url)
    .get(path)
    .reply(200, []);

    await pageload(link, outDirpath);

    const actual = await fs.readFile(fullFilePath);
    
    expect(scope.isDone()).toBeTruthy();
    expect(data1).toBeTruthy('Hello!');
})
