import cheerio from 'cheerio';
import path from 'path';
import url from 'url';

const getFileName = (link) => {
  const { hostname, pathname } = url.parse(link);
  const { dir, name, ext } = path.parse(pathname);
  const fileName = hostname ? path.join(hostname, dir, name) : path.join(dir, name);
  const normalizedName = fileName.slice(1).replace(/[./]/g, '-');
  return `${normalizedName}${ext}`
};

const tags = ['link', 'script', 'img'];

export default (html, localFilesPath) => {
  const $ = cheerio.load(html);

  const tagsWithLocalResources = $('script').add('img').add('link')
  .filter((i, tag) => {
    const src = $(tag).attr('src');
    if (!src) {
      return false;
    }
    const { hostname } = url.parse(src);
    return !hostname;
  })
  .each((i, node) => {
    const src = $(node).attr('src');
    const localPath = path.join(localFilesPath, getFileName(src));
    $(node).attr('src', localPath);
  })

  return $.html();
}
