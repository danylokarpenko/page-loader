import cheerio from 'cheerio';
import path from 'path';

const getFileName = (link, baseUrl) => {
  const url = new URL(link, baseUrl);
  const { dir, name, ext } = path.parse(url.pathname.slice(1));
  const fileName = path.join(dir, name);
  const normalizedName = fileName.replace(/[./]/g, '-');
  return `${normalizedName}${ext}`;
};

const checkIfRelativeUrl = (link) => {
  const host = 'https://localhost';
  const baseUrl = new URL(host);
  const srcUrl = new URL(link, host);
  const isRelativeUrl = srcUrl.hostname === baseUrl.hostname;
  return isRelativeUrl;
};

const mapping = {
  script: 'src',
  link: 'href',
  img: 'src',
};

const getTagsWithLocalLinks = (html) => {
  const $ = cheerio.load(html);

  const tags = [];

  Object.keys(mapping).forEach((tagName) => tags.push(...$(tagName).get()));
  const tagsWithLocalLinks = tags
    .filter((tag) => checkIfRelativeUrl(tag.attribs[mapping[tag.name]]));
  return tagsWithLocalLinks;
};

export default (html, distPath, pageUrl) => {
  const $ = cheerio.load(html);

  const tags = getTagsWithLocalLinks(html);

  tags.forEach((i, tag) => {
    const { name } = tag;
    const attribut = mapping[name];
    const link = $(name).attr(attribut);
    const localPath = path.join(distPath, getFileName(link, pageUrl));
    $(name).attr(attribut, localPath);
  });

  return $.html();
};
