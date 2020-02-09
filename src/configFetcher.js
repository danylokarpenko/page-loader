import cheerio from 'cheerio';
import url from 'url';

export default (html, pageUrl) => {
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
    .get();

  const configs = tagsWithLocalResources
    .map((tag) => (
      tag.name === 'img' ? {
        method: 'get',
        url: tag.attribs.src,
        baseURL: pageUrl,
        responseType: 'arraybuffer',
      } : {
        method: 'get',
        url: tag.attribs.src,
        baseURL: pageUrl,
      }));
  return configs;
};
