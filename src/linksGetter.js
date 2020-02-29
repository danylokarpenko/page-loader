import cheerio from 'cheerio';

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

const getLinks = (tags) => {
  const links = tags.map((tag) => tag.attribs[mapping[tag.name]]);
  return links;
};

const getTagsWithLocalLinks = (html) => {
  const $ = cheerio.load(html);

  const tags = [];

  Object.keys(mapping).forEach((tagName) => tags.push(...$(tagName).get()));
  const tagsWithLocalLinks = tags
    .filter((tag) => checkIfRelativeUrl(tag.attribs[mapping[tag.name]]));
  return tagsWithLocalLinks;
};

export default (html) => {
  const tags = getTagsWithLocalLinks(html);
  const links = getLinks(tags);

  return links;
};
