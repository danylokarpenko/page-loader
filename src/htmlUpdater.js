import cheerio from 'cheerio';
import path from 'path';
import getLinks from './linksGetter';

const getFileName = (link, baseUrl) => {
  const url = new URL(link, baseUrl);
  const { dir, name, ext } = path.parse(url.pathname.slice(1));
  const fileName = path.join(dir, name);
  const normalizedName = fileName.replace(/[./]/g, '-');
  return `${normalizedName}${ext}`;
};

const mapping = {
  script: 'src',
  link: 'href',
  img: 'src',
};

export default (html, distPath, pageUrl) => {
  const $ = cheerio.load(html);

  const tags = getLinks(html);

  tags.forEach((i, tag) => {
    const { name } = tag;
    const attribut = mapping[name];
    const link = $(name).attr(attribut);
    const localPath = path.join(distPath, getFileName(link, pageUrl));
    $(name).attr(attribut, localPath);
  });

  return $.html();
};
