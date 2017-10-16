const Crawler = require('simplecrawler');
const Page = require('./page-model');

const crawler = new Crawler('https://www.google.com');
const keywords = process.env.KEYWORDS.split(',');

crawler.on('crawlstart', () => {
  crawler.queue.defrost('queue.json', (err) => {
    if (err) return console.error('Error defrosting queue', err);
    console.log('Queue defrost');
  });

  setInterval(() => {
    crawler.queue.freeze('queue.json', (err) => {
      if (err) return console.error('Error freezing queue', err);
      console.log('Queue frozen');
    });
  }, 5000);
});

crawler.on('fetchcomplete', (queueItem, responseBuffer) => {
  const { url } = queueItem;
  const data = responseBuffer.toString();

  const words = keywords
    .map((word) => {
      const required = word.endsWith('!');
      if (required) word = word.slice(0, word.length - 1);

      const regex = new RegExp(word, 'gm');
      const matches = data.match(regex);
      if (!matches) return null;

      return { word, times: matches.length, required };
    })
    .filter(word => !!word);

  if (!words.find(word => word.required)) return console.log('No required words found for url', url);

  new Page({ url, words })
    .save()
    .then(() => console.log('Saved url', url))
    .catch(err => console.error('Error saving url', url, err));
});

require('./mongoose')
  .then(() => crawler.start())
  .catch(console.error);
